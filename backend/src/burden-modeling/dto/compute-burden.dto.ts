export class VulnerabilityProfile {
  chronicPain?: boolean;
  mobility?: boolean;
  cognitive?: boolean;
  sensory?: boolean;
  language?: boolean;
  alone?: boolean;
}

export class ComputeBurdenDto {
  facilityId: string;
  vulnerabilityMultiplier?: number; // used when profile not provided
  profile?: VulnerabilityProfile; // when provided, overrides vulnerabilityMultiplier
  estimatedCtasLevel: number; // 1-5
  waitTimeMinutes: number;
  checkInResponses?: {
    discomfortLevel?: number; // 1-5
    assistanceRequested?: string[];
    intendsToStay?: boolean;
    timestamp: string;
  }[];
}
