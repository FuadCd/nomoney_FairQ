import { Injectable } from '@nestjs/common';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { CheckInDto } from '../check-in/dto/check-in.dto';

/** In-memory patient record for sync across devices. */
export interface StoredPatient {
  id: string;
  waitStart: number;
  vulnerabilityScore: number;
  burdenIndex: number;
  alertLevel: string;
  flags: RegisterPatientDto['flags'];
  checkIns: Array<{
    discomfort: number;
    needsHelp: boolean;
    planningToLeave: boolean;
    assistanceRequested?: string[];
    planningToLeaveChoice?: string; // staying | unsure | leaving
    timestamp: number;
  }>;
  missedCheckIn?: boolean;
  /** When staff last recorded a check-in with this patient (ms). */
  lastStaffCheckInAt?: number;
  assignedHospitalKey: string;
  estimatedCtasLevel?: number;
  discomfortLevel?: number;
  disengagementWindowMinutes?: number;
}

@Injectable()
export class PatientsService {
  private readonly patients = new Map<string, StoredPatient>();

  register(dto: RegisterPatientDto): StoredPatient {
    const patient: StoredPatient = {
      id: dto.id,
      waitStart: dto.waitStart,
      vulnerabilityScore: dto.vulnerabilityScore,
      burdenIndex: dto.burdenIndex ?? 0,
      alertLevel: dto.alertLevel ?? 'green',
      flags: dto.flags,
      checkIns: dto.checkIns ?? [],
      assignedHospitalKey: dto.assignedHospitalKey,
      estimatedCtasLevel: dto.estimatedCtasLevel,
      discomfortLevel: dto.discomfortLevel,
    };
    this.patients.set(dto.id, patient);
    return patient;
  }

  /** Return all patients (single source of truth for staff/admin). */
  getAll(): StoredPatient[] {
    return Array.from(this.patients.values());
  }

  getByHospital(hospitalKey: string): StoredPatient[] {
    return Array.from(this.patients.values()).filter(
      (p) => p.assignedHospitalKey === hospitalKey,
    );
  }

  getById(id: string): StoredPatient | undefined {
    return this.patients.get(id);
  }

  /** Record that staff checked in with the patient. */
  recordStaffCheckIn(id: string): StoredPatient | undefined {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    patient.lastStaffCheckInAt = Date.now();
    patient.missedCheckIn = false;
    return patient;
  }

  /** Remove patient from queue (sent to doctor / off queue). */
  remove(id: string): boolean {
    return this.patients.delete(id);
  }

  addCheckIn(dto: CheckInDto): StoredPatient | undefined {
    const patient = this.patients.get(dto.passportId);
    if (!patient) return undefined;

    const checkIn = {
      discomfort: dto.discomfortLevel,
      needsHelp: !!(dto.assistanceRequested?.length),
      planningToLeave: !dto.intendsToStay,
      assistanceRequested: dto.assistanceRequested,
      planningToLeaveChoice: dto.planningToLeaveChoice,
      timestamp: dto.timestamp ? new Date(dto.timestamp).getTime() : Date.now(),
    };
    patient.checkIns.push(checkIn);
    patient.missedCheckIn = false;

    return patient;
  }
}
