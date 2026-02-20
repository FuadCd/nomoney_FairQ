import { Injectable } from '@nestjs/common';
import { ComputeBurdenDto } from './dto/compute-burden.dto';

export interface BurdenCurvePoint {
  timeMinutes: number;
  distressProbability: number;
  lwbsProbability: number;
  returnVisitRisk: number;
}

@Injectable()
export class BurdenModelingService {
  private readonly MONTE_CARLO_ITERATIONS = 200;

  computeBurden(dto: ComputeBurdenDto) {
    const points: BurdenCurvePoint[] = [];
    const maxTime = Math.min(180, dto.waitTimeMinutes + 60); // Up to 3 hours

    for (let t = 0; t <= maxTime; t += 5) {
      const baselineHazard = this.baselineHazard(t, dto.estimatedCtasLevel);
      const risk = baselineHazard * dto.vulnerabilityMultiplier;

      points.push({
        timeMinutes: t,
        distressProbability: Math.min(0.95, this.distressCurve(t, risk)),
        lwbsProbability: Math.min(0.95, this.lwbsCurve(t, risk)),
        returnVisitRisk: Math.min(0.8, this.returnVisitCurve(t, risk)),
      });
    }

    const equityGapScore = this.computeEquityGap(points, dto.vulnerabilityMultiplier);

    return {
      burdenCurve: points,
      equityGapScore,
      baselineCurve: points.map((p) => ({
        timeMinutes: p.timeMinutes,
        distressProbability: p.distressProbability / dto.vulnerabilityMultiplier,
        lwbsProbability: p.lwbsProbability / dto.vulnerabilityMultiplier,
      })),
      confidenceInterval: 0.95,
    };
  }

  private baselineHazard(timeMinutes: number, ctasLevel: number): number {
    const urgencyFactor = 6 - ctasLevel; // CTAS 1 = highest urgency
    return 0.001 * Math.exp(0.02 * timeMinutes) * urgencyFactor;
  }

  private distressCurve(timeMinutes: number, risk: number): number {
    return 1 - Math.exp(-risk * timeMinutes * 0.01);
  }

  private lwbsCurve(timeMinutes: number, risk: number): number {
    return 1 - Math.exp(-risk * timeMinutes * 0.008);
  }

  private returnVisitCurve(timeMinutes: number, risk: number): number {
    return (1 - Math.exp(-risk * 0.5)) * (timeMinutes / 120);
  }

  private computeEquityGap(
    points: BurdenCurvePoint[],
    vulnerabilityMultiplier: number,
  ): number {
    const lastPoint = points[points.length - 1];
    if (!lastPoint) return 0;
    const baselineLwbs = lastPoint.lwbsProbability / vulnerabilityMultiplier;
    return lastPoint.lwbsProbability - baselineLwbs;
  }
}
