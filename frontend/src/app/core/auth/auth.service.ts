import { Injectable } from '@angular/core';
import {
  HOSPITAL_CODES,
  type HospitalCode,
  isValidHospitalCode,
  toThreeDigitCode,
} from './hospital-codes';

const STORAGE_KEY_ROLE = 'accesser_role';
const STORAGE_KEY_STAFF_CODE = 'accesser_staff_code';
const STORAGE_KEY_STAFF_KEY = 'accesser_staff_key';

export type AppRole = 'patient' | 'staff';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _role: AppRole | null = this.loadRole();
  private _staffCode: HospitalCode | null = this.loadStaffCode();
  private _staffKey: string | null = this.loadStaffKey();

  private loadRole(): AppRole | null {
    if (typeof sessionStorage === 'undefined') return null;
    const r = sessionStorage.getItem(STORAGE_KEY_ROLE);
    return r === 'patient' || r === 'staff' ? r : null;
  }

  private loadStaffCode(): HospitalCode | null {
    if (typeof sessionStorage === 'undefined') return null;
    const c = sessionStorage.getItem(STORAGE_KEY_STAFF_CODE);
    return c && isValidHospitalCode(c) ? c : null;
  }

  private loadStaffKey(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEY_STAFF_KEY);
  }

  private persist(): void {
    if (typeof sessionStorage === 'undefined') return;
    if (this._role) sessionStorage.setItem(STORAGE_KEY_ROLE, this._role);
    else sessionStorage.removeItem(STORAGE_KEY_ROLE);
    if (this._staffCode) sessionStorage.setItem(STORAGE_KEY_STAFF_CODE, this._staffCode);
    else sessionStorage.removeItem(STORAGE_KEY_STAFF_CODE);
    if (this._staffKey) sessionStorage.setItem(STORAGE_KEY_STAFF_KEY, this._staffKey);
    else sessionStorage.removeItem(STORAGE_KEY_STAFF_KEY);
  }

  /** Enter as staff with a valid hospital code (001–005). */
  setStaffSession(code: string): boolean {
    const normalized = toThreeDigitCode(code);
    if (!normalized || !isValidHospitalCode(normalized)) return false;
    const info = HOSPITAL_CODES[normalized];
    this._role = 'staff';
    this._staffCode = normalized;
    this._staffKey = info.key;
    this.persist();
    return true;
  }

  /** Enter as patient (no code). */
  setPatientSession(): void {
    this._role = 'patient';
    this._staffCode = null;
    this._staffKey = null;
    this.persist();
  }

  get role(): AppRole | null {
    return this._role;
  }

  isStaff(): boolean {
    return this._role === 'staff';
  }

  isPatient(): boolean {
    return this._role === 'patient';
  }

  getStaffHospitalCode(): HospitalCode | null {
    return this._staffCode;
  }

  /** Backend facility key (e.g. uofa) for API calls. */
  getStaffHospitalKey(): string | null {
    return this._staffKey;
  }

  getStaffHospitalName(): string | null {
    if (!this._staffCode) return null;
    return HOSPITAL_CODES[this._staffCode].name;
  }

  clear(): void {
    this._role = null;
    this._staffCode = null;
    this._staffKey = null;
    this.persist();
  }
}
