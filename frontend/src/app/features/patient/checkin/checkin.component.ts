import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../patient.component';
import {
  CheckInFormComponent,
  CheckInFormResult,
} from '../../../components/patient/checkin-form.component';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CheckInFormComponent],
  template: `
    <div class="checkin-page">
      <button type="button" class="back-link back-btn" (click)="back()">&larr; Back</button>
      <app-checkin-form (completed)="onComplete($event)" />
    </div>
  `,
  styles: [
    `
      .checkin-page {
        padding: 0.5rem 0;
      }
      .back-link {
        display: inline-block;
        margin-bottom: 1rem;
        color: var(--p-accent, #0d47a1);
        text-decoration: none;
        font-size: 0.9rem;
      }
      .back-link:hover {
        text-decoration: underline;
      }
      .back-btn {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
      }
    `,
  ],
})
export class CheckinComponent {
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  /** Back: previous in session sequence is Waiting. */
  back(): void {
    this.router.navigate(['/patient/waiting']);
  }

  onComplete(result: CheckInFormResult): void {
    // Ready for P2 integration: addCheckIn(patientId, checkIn)
    const patientId =
      typeof sessionStorage !== 'undefined'
        ? (sessionStorage.getItem('patient_id') ?? 'unknown')
        : 'unknown';
    console.log('[P3 CheckIn] result ready for store integration:', {
      patientId,
      discomfort: result.discomfort,
      needsHelp: result.needs.length > 0 && !result.needs.includes('none'),
      planningToLeave: result.planningToLeave === 'leaving',
      timestamp: Date.now(),
    });
    this.router.navigate(['/patient/waiting']);
  }
}
