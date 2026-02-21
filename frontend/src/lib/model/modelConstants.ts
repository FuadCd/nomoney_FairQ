// frontend/src/lib/model/modelConstants.ts

/**
 * Mirrors backend constants for dashboard display and client-side logic.
 * Source: CIHI NACRS, McMaster ED LWBS study.
 */

/** CIHI: median total ED stay (minutes) */
export const MEDIAN_TOTAL_STAY_MINUTES = 238;

/** CIHI: median time to physician (minutes) */
export const MEDIAN_TO_PHYSICIAN_MINUTES = 90;

/**
 * McMaster median time-to-physician among triage-matched controls.
 * Reference for "beyond median physician access" — used for Amber check-in suggestion.
 */
export const MCM_MASTER_MEDIAN_TIME_TO_PHYSICIAN_MINUTES = 87;
