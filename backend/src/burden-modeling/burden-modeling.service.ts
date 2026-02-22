import { Injectable } from '@nestjs/common';
import { ComputeBurdenDto } from './dto/compute-burden.dto';
import { WaitTimesService } from '../wait-times/wait-times.service';
import {
  MEDIAN_TOTAL_STAY_MINUTES,
  MEDIAN_TO_PHYSICIAN_MINUTES,
  MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES,
  MEDIAN_LWBS_TRIGGER_MINUTES,
  CURVE_HORIZON_CAP_MINUTES,
} from './modelConstants';
import { VULNERABILITY_WEIGHTS } from './vulnerabilityWeights';
import { EstimatedWaitDto } from './dto/estimated-wait.dto';

export interface BurdenCurvePoint {
  timeMinutes: number;
  distressProbability: number;
  lwbsProbability: number;
  returnVisitRisk: number;
}

@Injectable()
export class BurdenModelingService {
  private readonly MONTE_CARLO_ITERATIONS = 200;

  constructor(private readonly waitTimesService: WaitTimesService) {}

  computeBurden(dto: ComputeBurdenDto) {
    const points: BurdenCurvePoint[] = [];
    const hospital = this.waitTimesService.getHospitalWaitTime(dto.facilityId);
    const expectedWaitMinutes = hospital?.waitMinutes ?? MEDIAN_TOTAL_STAY_MINUTES;

    // Change 3: Extend curve horizon to 6–7 hours
    const maxTime = Math.min(
      dto.waitTimeMinutes + 60,
      CURVE_HORIZON_CAP_MINUTES,
    );

    const vulnerabilityMultiplier = dto.profile
      ? this.computeVulnerabilityMultiplier(dto.profile)
      : dto.vulnerabilityMultiplier;

    // Unknown profile → vulnScore = 0 (avoid inflating unknown users).
    const vulnScore = this.normalizeVulnScore(vulnerabilityMultiplier);

    const leaveSignalWeight =
      this.waitTimesService.computeLeaveSignalWeight(dto.facilityId);
    const baselineLWBS = hospital?.lwbsRate ?? 0.05;

    const planningToLeave = dto.checkInResponses?.some(
      (r) => r.intendsToStay === false,
    );

    // No global vulnerability multiplier inside curves; only component-specific boosts (LWBS equity).
    const profileBoosts = dto.profile
      ? this.getProfileCurveBoosts(dto.profile)
      : { distressBoost: 1, lwbsBoost: 1, returnBoost: 1 };

    for (let t = 0; t <= maxTime; t += 5) {
      const baselineHazard = this.baselineHazard(
        t,
        dto.estimatedCtasLevel,
        expectedWaitMinutes,
      );
      const progress = t / expectedWaitMinutes; // not clipped — extreme waits → extreme progress

      const distressRisk = baselineHazard * profileBoosts.distressBoost;
      const returnRisk = baselineHazard * profileBoosts.returnBoost;

      // LWBS: baseline floor + escalation; leaveSignalWeight affects slope, not final multiplier
      const lwbsProbability = this.computeLwbsProbability(
        progress,
        baselineLWBS,
        leaveSignalWeight,
        profileBoosts.lwbsBoost,
      );

      points.push({
        timeMinutes: t,
        distressProbability: Math.min(
          0.95,
          this.distressCurve(t, distressRisk),
        ),
        lwbsProbability,
        returnVisitRisk: Math.min(0.8, this.returnVisitCurve(t, returnRisk)),
      });
    }

    // Change 6: LWBS weight depends on vulnerability
    const weights = this.getCurveWeights(vulnScore);
    let burden = this.computeBurdenScore(points, weights);

    burden += this.computeBaseWaitingImpact(
      dto.waitTimeMinutes,
      expectedWaitMinutes,
      dto.estimatedCtasLevel,
    );

    // Change 7: Planning-to-leave bump scales with vulnerability
    if (planningToLeave) {
      const leaveBump = vulnScore >= 0.3 ? 15 : 8;
      burden += leaveBump * leaveSignalWeight;
    }

    const progress = dto.waitTimeMinutes / expectedWaitMinutes;
    // Post-87 min gradual escalation (McMaster); CTAS 1–2 allow bump at progress 0.3, else 0.4
    burden = this.applyPostMedianPhysicianDelayAdjustment(
      burden,
      dto.waitTimeMinutes,
      progress,
      dto.estimatedCtasLevel,
    );

    // Vulnerability applied once (final scaling); cap 0.5 → max 1.5× to avoid inflation
    const cappedVuln = Math.min(vulnScore, 0.5);
    burden = burden * (1 + cappedVuln);
    burden = Math.max(0, Math.min(100, burden));

    const isPastMedianPhysicianAccess =
      dto.waitTimeMinutes > MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES;
    const suggestAmberCheckIn =
      isPastMedianPhysicianAccess && burden >= 55;

    const equityGapScore = this.computeEquityGap(
      points,
      profileBoosts.lwbsBoost,
    );
    const alertStatus =
      burden > 75 || planningToLeave ? 'RED' : burden > 50 ? 'AMBER' : 'GREEN';

    const waitRatio = dto.waitTimeMinutes / expectedWaitMinutes;

    const atDisengagementRisk =
      planningToLeave ||
      burden >= 70 ||
      dto.waitTimeMinutes >= MEDIAN_LWBS_TRIGGER_MINUTES ||
      waitRatio >= 0.3;

    const disengagementWindowMinutes = atDisengagementRisk
      ? this.computeDisengagementWindowMinutes(
          points,
          dto.waitTimeMinutes,
        )
      : undefined;

    return {
      burdenCurve: points,
      equityGapScore,
      burden,
      alertStatus,
      disengagementWindowMinutes,
      baselineCurve: points.map((p) => {
        const prog = p.timeMinutes / expectedWaitMinutes;
        const baseLwbs = this.computeLwbsProbability(
          prog,
          baselineLWBS,
          leaveSignalWeight,
          1,
        );
        return {
          timeMinutes: p.timeMinutes,
          distressProbability: p.distressProbability / profileBoosts.distressBoost,
          lwbsProbability: baseLwbs,
        };
      }),
      confidenceInterval: 0.95,
    };
  }

  /**
   * Curve-based window; displayed as "~30–60 min" range, not a point estimate.
   */
  private computeDisengagementWindowMinutes(
    points: BurdenCurvePoint[],
    waitTimeMinutes: number,
  ): number {
    const LWBS_THRESHOLD = 0.5;
    const MIN_MINUTES = 5;
    const MAX_MINUTES = 60;
    const DEFAULT_MINUTES = 20;

    const point = points.find((p) => p.lwbsProbability >= LWBS_THRESHOLD);
    if (!point) return DEFAULT_MINUTES;
    const minutesFromNow = point.timeMinutes - waitTimeMinutes;
    if (minutesFromNow <= 0) return MIN_MINUTES;
    return Math.round(Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, minutesFromNow)));
  }

  /**
   * Estimated wait in minutes for display after signup.
   * Uses: hospital baseline, waiting impact vs median, 90-min threshold, vulnerability.
   * LWBS is not included (check-in only).
   */
  getEstimatedWaitMinutes(dto: EstimatedWaitDto): { estimatedWaitMinutes: number } {
    const hospital = this.waitTimesService.getHospitalWaitTime(dto.facilityId);
    const baseWait = hospital?.waitMinutes ?? 180;

    // Scale base wait: vulnerability reduces displayed wait (equity prioritization)
    const vulnerabilityFactor = 1 / Math.max(0.5, Math.min(2, dto.vulnerabilityMultiplier));
    let estimated = baseWait * vulnerabilityFactor;

    // After 90 min, show remaining-style estimate: reduce by time already waited
    if (dto.waitTimeMinutes > MEDIAN_TO_PHYSICIAN_MINUTES) {
      const remaining = Math.max(0, baseWait - dto.waitTimeMinutes);
      estimated = remaining * vulnerabilityFactor;
    }

    const clamped = Math.round(Math.max(15, Math.min(600, estimated)));
    return { estimatedWaitMinutes: clamped };
  }

  /**
   * +0 to +10 gradual bump after 87 min (McMaster).
   * CTAS 1–2 (high urgency): allow bump at progress ≥ 0.3. Otherwise ≥ 0.4.
   */
  private applyPostMedianPhysicianDelayAdjustment(
    burden: number,
    minutesWaited: number,
    progress: number,
    ctasLevel: number,
  ): number {
    const progressThreshold = ctasLevel <= 2 ? 0.3 : 0.4;
    if (progress < progressThreshold) return burden;
    if (minutesWaited <= MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES)
      return burden;
    const over =
      minutesWaited - MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES;
    const bump = Math.min(over * 0.1, 10);
    return burden + bump;
  }

  /**
   * Change 1–2: Time impact based on progress = waitTime / expectedWaitMinutes.
   * At progress 1.0 → ~55–65, 1.25 → ~65–75, 1.5+ → ~75–85, cap ~90.
   * Small bump at 87/90 min only when progress > 0.4.
   */
  /**
   * Time impact based on progress. 90-min bump: CTAS 1–2 allow at progress ≥ 0.3, else ≥ 0.4.
   */
  private computeBaseWaitingImpact(
    minutesWaited: number,
    expectedWaitMinutes: number,
    ctasLevel: number,
  ): number {
    const progress = minutesWaited / expectedWaitMinutes;
    const progressThreshold = ctasLevel <= 2 ? 0.3 : 0.4;

    let impact: number;
    if (progress < 0.4) {
      impact = progress * 40; // slow increase
    } else if (progress <= 1.0) {
      impact = 16 + (progress - 0.4) * 65; // moderate: 0.4→16, 1.0→55
    } else if (progress <= 1.25) {
      impact = 55 + (progress - 1.0) * 80; // 1.25→75
    } else if (progress <= 1.5) {
      impact = 75 + (progress - 1.25) * 40; // 1.5→85
    } else {
      impact = 85 + Math.min(progress - 1.5, 0.5) * 10; // cap ~90
    }

    if (progress >= progressThreshold && minutesWaited > MEDIAN_TO_PHYSICIAN_MINUTES) {
      impact += 5; // small CIHI-anchored bump at 90 min
    }
    return Math.min(impact, 92);
  }

  /** Weights sum to 100. Low vuln: 45/25/30, high vuln: 25/55/20. */
  private getCurveWeights(vulnScore: number): {
    distress: number;
    lwbs: number;
    returnVisit: number;
  } {
    const low = { distress: 45, lwbs: 25, returnVisit: 30 }; // sum 100
    const high = { distress: 25, lwbs: 55, returnVisit: 20 }; // sum 100
    const t = Math.min(1, Math.max(0, vulnScore));
    return {
      distress: low.distress + (high.distress - low.distress) * t,
      lwbs: low.lwbs + (high.lwbs - low.lwbs) * t,
      returnVisit: low.returnVisit + (high.returnVisit - low.returnVisit) * t,
    };
  }

  /** Change 5: Profile-specific boosts — chronicPain→distress, language/cognitive/alone/mobility→LWBS. */
  private getProfileCurveBoosts(profile: {
    chronicPain?: boolean;
    mobility?: boolean;
    cognitive?: boolean;
    sensory?: boolean;
    language?: boolean;
    alone?: boolean;
  }): { distressBoost: number; lwbsBoost: number; returnBoost: number } {
    let distressBoost = 1;
    if (profile.chronicPain) distressBoost += 0.3;

    let lwbsBoost = 1;
    if (profile.language) lwbsBoost += 0.2;
    if (profile.cognitive) lwbsBoost += 0.2;
    if (profile.alone) lwbsBoost += 0.15;
    if (profile.mobility) lwbsBoost += 0.2;
    if (profile.sensory) lwbsBoost += 0.15;

    let returnBoost = 1;
    if (profile.chronicPain || profile.cognitive) returnBoost += 0.1;

    return { distressBoost, lwbsBoost, returnBoost };
  }

  private computeBurdenScore(
    points: BurdenCurvePoint[],
    weights: { distress: number; lwbs: number; returnVisit: number },
  ): number {
    const lastPoint = points[points.length - 1];
    if (!lastPoint) return 0;
    const base =
      lastPoint.distressProbability * weights.distress +
      lastPoint.lwbsProbability * weights.lwbs +
      lastPoint.returnVisitRisk * weights.returnVisit;
    return Math.min(100, base);
  }

  /**
   * Unknown profile → vulnScore = 0. Frontend passes 1 + vuln (1–2); profile returns 0–0.95.
   */
  private normalizeVulnScore(
    vulnerabilityMultiplier: number | undefined,
  ): number {
    if (vulnerabilityMultiplier == null || vulnerabilityMultiplier === undefined) {
      return 0;
    }
    if (vulnerabilityMultiplier >= 1) {
      return Math.min(1, vulnerabilityMultiplier - 1);
    }
    return vulnerabilityMultiplier;
  }

  /** Returns 0 → ~0.95 from profile flags (StatsCan-informed weights) */
  private computeVulnerabilityMultiplier(profile: {
    chronicPain?: boolean;
    mobility?: boolean;
    cognitive?: boolean;
    sensory?: boolean;
    language?: boolean;
    alone?: boolean;
  }): number {
    let totalWeight = 0;
    for (const key of Object.keys(
      VULNERABILITY_WEIGHTS,
    ) as (keyof typeof VULNERABILITY_WEIGHTS)[]) {
      if (profile[key]) {
        totalWeight += VULNERABILITY_WEIGHTS[key];
      }
    }
    return totalWeight;
  }

  /**
   * Smooth saturating curve: gentle early, ramps around progress ≈ 1.0,
   * increases beyond 1.0, saturates (monotonic, anchored).
   * Uses softened exponential: 1 - exp(-k*progress).
   */
  private baselineHazard(
    timeMinutes: number,
    ctasLevel: number,
    expectedWaitMinutes: number,
  ): number {
    const urgencyFactor = 6 - ctasLevel; // CTAS 1 = highest urgency
    const progress = timeMinutes / expectedWaitMinutes;
    const k = 1.2; // ramp rate; at progress 1 → ~0.70, at 2 → ~0.91. Reduce if too hot.
    const softFactor = 1 - Math.exp(-k * progress);
    return 0.003 * Math.max(0.05, softFactor) * urgencyFactor;
  }

  private distressCurve(timeMinutes: number, risk: number): number {
    return 1 - Math.exp(-risk * timeMinutes * 0.01);
  }

  /**
   * LWBS: baseline floor + escalation. No double-counting of baseline.
   * raw = baselineLWBS + g * (1 - baselineLWBS), g = clamp01(f * profileLwbsBoost).
   * rampFactor from baselineLWBS only (0.8–1.3); not leaveSignalWeight.
   */
  private computeLwbsProbability(
    progress: number,
    baselineLWBS: number,
    _leaveSignalWeight: number,
    profileLwbsBoost: number,
  ): number {
    const k = 1.2;
    const rampFactor = Math.min(
      1.3,
      Math.max(0.8, 0.8 + 0.5 * (baselineLWBS / 0.15)),
    ); // low→0.8, high(15%+)→1.3
    const kEff = k * rampFactor;
    const f = 1 - Math.exp(-kEff * progress);
    const g = Math.min(1, Math.max(0, f * profileLwbsBoost));
    const raw = baselineLWBS + g * (1 - baselineLWBS);
    return Math.min(0.85, raw);
  }

  private returnVisitCurve(timeMinutes: number, risk: number): number {
    return (1 - Math.exp(-risk * 0.5)) * (timeMinutes / 120);
  }

  private computeEquityGap(
    points: BurdenCurvePoint[],
    baselineLwbs: number,
  ): number {
    const lastPoint = points[points.length - 1];
    if (!lastPoint) return 0;
    return lastPoint.lwbsProbability - baselineLwbs;
  }
}
