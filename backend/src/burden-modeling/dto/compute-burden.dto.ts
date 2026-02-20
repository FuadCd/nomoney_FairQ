export class ComputeBurdenDto {
  facilityId: string;
  vulnerabilityMultiplier: number;
  estimatedCtasLevel: number; // 1-5
  waitTimeMinutes: number;
  checkInResponses?: {
    discomfortLevel?: number; // 1-5
    assistanceRequested?: string[];
    intendsToStay?: boolean;
    timestamp: string;
  }[];
}
