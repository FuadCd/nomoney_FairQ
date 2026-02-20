export class AccessibilityProfileDto {
  mobilitySupport?: boolean;
  noiseLightSensitivity?: boolean;
  languagePreference?: string;
  chronicConditionsAffectingWait?: string[];
  communicationOrCognitiveNeeds?: boolean;
  caregiverPresent?: boolean;
  estimatedCtasLevel?: number; // 1-5, modeling only
  facilityId?: string;
  arrivalTime?: string;
}
