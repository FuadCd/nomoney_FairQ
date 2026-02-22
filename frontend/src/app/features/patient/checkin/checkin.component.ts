import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../patient.component';
import { CheckInService } from '../../../core/services/check-in.service';
import { PatientStoreService } from '../../../core/patient-store.service';
import {
  CheckInFormComponent,
  CheckInFormResult,
} from '../../../components/patient/checkin-form.component';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CheckInFormComponent],
  template: `
    <div class="checkin-page p-4">
      <button type="button" class="back-link back-btn mb-6" (click)="back()">&larr; Back</button>
      <div class="checkin-card">
        <app-checkin-form (completed)="onComplete($event)" />
      </div>
    </div>
  `,
  styles: [
    `
      .checkin-page { max-width: 672px; margin: 0 auto; }
      .checkin-card {
        background: white;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        padding: 1.5rem;
      }
      .back-link {
        display: inline-block;
        color: var(--p-accent, #2563eb);
        text-decoration: none;
        font-size: 0.875rem;
      }
      .back-link:hover { text-decoration: underline; }
      .back-btn { background: none; border: none; padding: 0; font: inherit; cursor: pointer; }
    `,
  ],
})
export class CheckinComponent {
  private readonly router = inject(Router);
  private readonly checkInService = inject(CheckInService);
  private readonly store = inject(PatientStoreService);
  readonly i18n = inject(I18nService);

  /** Back: previous in session sequence is Waiting. */
  back(): void {
    this.router.navigate(['/patient/waiting']);
  }

  onComplete(result: CheckInFormResult): void {
    const patientId =
      typeof sessionStorage !== 'undefined'
        ? (sessionStorage.getItem('patient_id') ?? 'unknown')
        : 'unknown';

    const assistanceRequested = this.mapNeedsToBackend(result.needs);
    const intendsToStay = result.planningToLeave !== 'leaving';
    const timestamp = new Date().toISOString();

    const checkInPayload = {
      discomfort: result.discomfort,
      needsHelp: result.needs.length > 0 && !result.needs.includes('none'),
      planningToLeave: result.planningToLeave === 'leaving',
      timestamp: Date.now(),
    };

    this.checkInService
      .submitCheckIn({
        passportId: patientId,
        discomfortLevel: result.discomfort,
        assistanceRequested: assistanceRequested.length ? assistanceRequested : undefined,
        intendsToStay,
        timestamp,
      })
      .subscribe({
        next: () => {
          this.store.addCheckIn(patientId, checkInPayload);
          this.router.navigate(['/patient/waiting']);
        },
        error: () => {
          this.store.addCheckIn(patientId, checkInPayload);
          this.router.navigate(['/patient/waiting']);
        },
      });
  }

  /** Map form need keys to backend assistanceRequested values. */
  private mapNeedsToBackend(needs: string[]): string[] {
    const filtered = needs.filter((k) => k !== 'none');
    return filtered.map((k) => (k === 'quiet' ? 'quiet-space' : k));
  }
}
