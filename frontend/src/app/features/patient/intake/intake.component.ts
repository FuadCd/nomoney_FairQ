import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { I18nService, IntakeAccessibilityProfile } from '../patient.component';
import { StepComplaintComponent } from '../../../components/patient/step-complaint.component';
import { StepAccessibilityComponent } from '../../../components/patient/step-accessibility.component';
import { StepConfirmComponent } from '../../../components/patient/step-confirm.component';

@Component({
  selector: 'app-intake',
  standalone: true,
  imports: [StepComplaintComponent, StepAccessibilityComponent, StepConfirmComponent],
  template: `
    <div class="intake">
      <button type="button" class="back-link back-btn" (click)="back()">&larr; Back</button>
      <div
        class="progress"
        role="progressbar"
        [attr.aria-valuenow]="stepParam()"
        aria-valuemin="1"
        aria-valuemax="3"
      >
        {{ i18n.t('stepXof3', { step: stepParam().toString() }) }}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="(stepParam() / 3) * 100"></div>
      </div>

      @switch (stepParam()) {
        @case (1) {
          <div class="fade-in">
            <app-step-complaint [useEmojiSeverity]="false" (completed)="onComplaintDone($event)" />
          </div>
        }
        @case (2) {
          <div class="fade-in">
            <app-step-accessibility (completed)="onAccessibilityDone($event)" />
          </div>
        }
        @case (3) {
          <div class="fade-in">
            <app-step-confirm
              [complaint]="complaint()"
              [severity]="severity()"
              [accessibilityProfile]="accessibilityProfile()"
              [anonymousId]="anonymousId"
            />
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .intake {
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
      .progress {
        text-align: center;
        font-weight: 600;
        color: var(--p-accent, #0d47a1);
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
      }
      .progress-bar {
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        margin-bottom: 1.5rem;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--p-accent, #0d47a1);
        border-radius: 3px;
        transition: width 0.3s ease;
      }
      .fade-in {
        animation: fadeSlide 0.3s ease-out;
      }
      @keyframes fadeSlide {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class IntakeComponent {
  readonly i18n = inject(I18nService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly stepParam = toSignal(
    this.route.paramMap.pipe(map((p) => Math.min(3, Math.max(1, +(p.get('step') ?? 1) || 1)))),
    { initialValue: 1 }
  );
  readonly complaint = signal('');
  readonly severity = signal(1);
  readonly accessibilityProfile = signal<IntakeAccessibilityProfile>({
    mobility: false,
    sensory: false,
    chronicPain: false,
    cognitive: false,
    language: false,
    supportPerson: false,
  });
  readonly anonymousId = Math.random().toString(36).substring(2, 10).toUpperCase();

  constructor() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('patient_id', this.anonymousId);
    }
  }

  onComplaintDone(data: { complaint: string; severity: number }): void {
    this.complaint.set(data.complaint);
    this.severity.set(data.severity);
    this.router.navigate(['/patient/intake/2']);
    window.scrollTo(0, 0);
  }

  onAccessibilityDone(profile: IntakeAccessibilityProfile): void {
    this.accessibilityProfile.set(profile);
    this.router.navigate(['/patient/intake/3']);
    window.scrollTo(0, 0);
  }

  /** Back follows session sequence: step 1 → login; step 2 → step 1; step 3 → step 2. */
  back(): void {
    const step = this.stepParam();
    if (step === 1) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/patient/intake', step - 1]);
    }
  }
}
