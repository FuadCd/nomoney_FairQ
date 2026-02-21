import { Injectable } from '@nestjs/common';
import { ALBERTA_WAITTIMES_SNAPSHOT } from './alberta-waittimes.snapshot';

export interface ErFacility {
  id: string;
  name: string;
  city: string;
  averageWaitMinutes: number;
  lastUpdated: string;
}

@Injectable()
export class WaitTimesService {
  getSnapshot() {
    return ALBERTA_WAITTIMES_SNAPSHOT;
  }

  getHospitalWaitTime(hospitalKey: string) {
    const hospital =
      (ALBERTA_WAITTIMES_SNAPSHOT.hospitals as Record<string, { key: string; name: string; city: string; waitMinutes: number }>)[hospitalKey];
    if (!hospital) return null;
    return hospital;
  }

  getFacilities(): ErFacility[] {
    const hospitals = Object.values(ALBERTA_WAITTIMES_SNAPSHOT.hospitals);
    return hospitals.map((h, i) => ({
      id: String(i + 1),
      name: h.name,
      city: h.city,
      averageWaitMinutes: h.waitMinutes,
      lastUpdated: ALBERTA_WAITTIMES_SNAPSHOT.snapshotTakenAt,
    }));
  }

  getCurrentWaitTimes() {
    return this.getFacilities();
  }
}
