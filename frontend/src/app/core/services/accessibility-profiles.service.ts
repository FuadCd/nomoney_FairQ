import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  vulnerabilityMultiplier: number;
}

export interface AccessibilityProfileInput {
  mobilitySupport?: boolean;
  noiseLightSensitivity?: boolean;
  languagePreference?: string;
  chronicConditionsAffectingWait?: string[];
  communicationOrCognitiveNeeds?: boolean;
  caregiverPresent?: boolean;
  estimatedCtasLevel?: number;
  facilityId?: string;
  arrivalTime?: string;
}

@Injectable({ providedIn: 'root' })
export class AccessibilityProfilesService {
  constructor(private api: ApiService) {}

  getProfileTemplates(): Observable<ProfileTemplate[]> {
    return this.api.get<ProfileTemplate[]>('/accessibility-profiles/templates');
  }

  computeProfile(input: AccessibilityProfileInput) {
    return this.api.post('/accessibility-profiles/compute', input);
  }
}
