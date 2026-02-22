import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import type { StoredPatient } from './patients.service';
import { RegisterPatientDto } from './dto/register-patient.dto';

function getSuggestedActions(body: { discomfortLevel: number; assistanceRequested?: string[]; intendsToStay: boolean }): string[] {
  const actions: string[] = [];
  if (body.discomfortLevel >= 4) actions.push('check-in-recommended');
  if (body.assistanceRequested?.includes('interpreter')) actions.push('interpreter-page-suggested');
  if (body.assistanceRequested?.includes('quiet-space')) actions.push('quiet-space-availability-check');
  if (!body.intendsToStay) actions.push('staff-alert-intent-to-leave');
  return actions;
}

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  register(@Body() dto: RegisterPatientDto) {
    return this.patientsService.register(dto);
  }

  @Get()
  getAll(@Query('hospitalKey') hospitalKey?: string): StoredPatient[] {
    if (hospitalKey?.trim()) {
      return this.patientsService.getByHospital(hospitalKey.trim());
    }
    return this.patientsService.getAll();
  }

  @Post(':id/staff-checkin')
  recordStaffCheckIn(@Param('id') id: string): StoredPatient | null {
    const patient = this.patientsService.recordStaffCheckIn(id);
    return patient ?? null;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { ok: boolean } {
    return { ok: this.patientsService.remove(id) };
  }

  @Post(':id/checkins')
  addCheckIn(
    @Param('id') id: string,
    @Body() body: { discomfortLevel: number; assistanceRequested?: string[]; intendsToStay: boolean; planningToLeaveChoice?: string; timestamp?: string },
  ) {
    const dto = { passportId: id, ...body };
    const patient = this.patientsService.addCheckIn(dto);
    if (!patient) {
      return { patient: null, suggestedActions: [], nextCheckInMinutes: 20 };
    }
    return {
      patient,
      suggestedActions: getSuggestedActions(body),
      nextCheckInMinutes: 20,
    };
  }
}
