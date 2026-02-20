import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface ErFacility {
  id: string;
  name: string;
  city: string;
  averageWaitMinutes: number;
  lastUpdated: string;
}

@Injectable({ providedIn: 'root' })
export class WaitTimesService {
  constructor(private api: ApiService) {}

  getFacilities(): Observable<ErFacility[]> {
    return this.api.get<ErFacility[]>('/wait-times/facilities');
  }

  getCurrentWaitTimes(): Observable<ErFacility[]> {
    return this.api.get<ErFacility[]>('/wait-times/current');
  }
}
