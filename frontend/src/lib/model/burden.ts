// frontend/src/lib/model/burden.ts
import { MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES } from './modelConstants';

/**
 * Whether to suggest an Amber check-in / staff touchpoint.
 * Extended wait beyond typical physician access + moderate burden.
 */
export function shouldSuggestAmberCheckIn(
  minutesWaited: number,
  burden: number
): boolean {
  const isPastMedianPhysicianAccess =
    minutesWaited > MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES;
  return isPastMedianPhysicianAccess && burden >= 55;
}
