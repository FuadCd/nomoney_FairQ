/**
 * MVP hospital codes. Staff enter one of these to access the staff dashboard.
 * Maps code → backend facility key (alberta-waittimes.snapshot).
 */
export const HOSPITAL_CODES = {
  '001': {
    key: 'uofa',
    name: 'University of Alberta Hospital',
  },
  '002': {
    key: 'royalAlexandra',
    name: 'Royal Alexandra Hospital',
  },
  '003': {
    key: 'greyNuns',
    name: 'Grey Nuns Community Hospital',
  },
  '004': {
    key: 'misericordia',
    name: 'Misericordia Community Hospital',
  },
  '005': {
    key: 'sturgeon',
    name: 'Sturgeon Community Hospital',
  },
} as const;

export type HospitalCode = keyof typeof HOSPITAL_CODES;

export function isValidHospitalCode(code: string): code is HospitalCode {
  return code in HOSPITAL_CODES;
}

export function normalizeHospitalCode(input: string): string {
  return input.trim().replace(/^0+/, '') || '0';
}

export function toThreeDigitCode(input: string): HospitalCode | null {
  const n = parseInt(input.trim(), 10);
  if (Number.isNaN(n) || n < 1 || n > 5) return null;
  return String(n).padStart(3, '0') as HospitalCode;
}
