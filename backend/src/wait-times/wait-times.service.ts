import { Injectable } from '@nestjs/common';

export interface ErFacility {
  id: string;
  name: string;
  city: string;
  averageWaitMinutes: number;
  lastUpdated: string;
}

@Injectable()
export class WaitTimesService {
  // Placeholder: integrate with AHS ER wait-time data when available
  getFacilities(): ErFacility[] {
    return [
      {
        id: '1',
        name: 'Foothills Medical Centre',
        city: 'Calgary',
        averageWaitMinutes: 72,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Rockyview General Hospital',
        city: 'Calgary',
        averageWaitMinutes: 58,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  getCurrentWaitTimes() {
    return this.getFacilities();
  }
}
