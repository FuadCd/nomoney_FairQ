import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface CheckInInput {
  passportId: string;
  discomfortLevel: number;
  assistanceRequested?: string[];
  intendsToStay: boolean;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class CheckInService {
  constructor(private api: ApiService) {}

  submitCheckIn(input: CheckInInput): Observable<{
    accepted: boolean;
    riskElevated: boolean;
    suggestedActions: string[];
    nextCheckInMinutes: number;
  }> {
    return this.api.post('/check-in', input);
  }
}
