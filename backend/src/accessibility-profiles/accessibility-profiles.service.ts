import { Injectable } from '@nestjs/common';
import { AccessibilityProfileDto } from './dto/accessibility-profile.dto';

export interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  vulnerabilityMultiplier: number;
}

@Injectable()
export class AccessibilityProfilesService {
  getProfileTemplates(): ProfileTemplate[] {
    return [
      { id: 'baseline', name: 'Baseline', description: 'No accessibility flags', vulnerabilityMultiplier: 1 },
      { id: 'mobility', name: 'Mobility Support', description: 'Wheelchair or mobility aid', vulnerabilityMultiplier: 1.4 },
      { id: 'sensory', name: 'Sensory Sensitivity', description: 'Noise/light sensitivity (autism, PTSD)', vulnerabilityMultiplier: 1.6 },
      { id: 'chronic-pain', name: 'Chronic Pain', description: 'Prolonged sitting tolerance', vulnerabilityMultiplier: 1.5 },
      { id: 'language', name: 'Language Barrier', description: 'Non-English/French preference', vulnerabilityMultiplier: 1.3 },
      { id: 'cognitive', name: 'Cognitive/Communication', description: 'Communication or cognitive needs', vulnerabilityMultiplier: 1.5 },
    ];
  }

  computeProfile(dto: AccessibilityProfileDto) {
    let multiplier = 1;
    if (dto.mobilitySupport) multiplier *= 1.4;
    if (dto.noiseLightSensitivity) multiplier *= 1.6;
    if (dto.languagePreference && dto.languagePreference !== 'en' && dto.languagePreference !== 'fr') multiplier *= 1.3;
    if (dto.communicationOrCognitiveNeeds) multiplier *= 1.5;
    if (dto.chronicConditionsAffectingWait?.length) multiplier *= 1.2;

    return {
      vulnerabilityMultiplier: multiplier,
      profileId: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }
}
