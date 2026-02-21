import { Component, Injectable, signal, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/* ─── Shared accessibility profile type ─── */
export interface IntakeAccessibilityProfile {
  mobility: boolean;
  sensory: boolean;
  chronicPain: boolean;
  cognitive: boolean;
  language: boolean;
  supportPerson: boolean;
}

/* ─── Inline i18n translations ─── */
const EN: Record<string, string> = {
  stepXof3: 'Step {{step}} of 3',
  complaintQuestion: 'What brings you in today?',
  complaintPlaceholder: 'Describe what brings you in today',
  severityQuestion: 'How much discomfort are you feeling?',
  severity1: '1 – Minimal',
  severity2: '2 – Mild',
  severity3: '3 – Moderate',
  severity4: '4 – Severe',
  severity5: '5 – Emergency',
  accessibilityIntro: "Let's make your visit comfortable.",
  q_mobility: 'Do you use a wheelchair or walking aid?',
  q_sensory: 'Do loud environments cause you distress?',
  q_chronicPain: 'Do you have ongoing pain that makes sitting difficult?',
  q_cognitive: 'Do you need information shown with larger text?',
  q_language: 'Do you prefer quieter communication?',
  q_support: 'Would you like a support person to stay with you?',
  yes: 'YES',
  no: 'NO',
  languageLabel: 'Language',
  confirmButton: 'Confirm and Check In',
  waitingTitle: "You're checked in!",
  waitingTime: 'Estimated wait: ~15 minutes',
  waitingMessage: "We'll check in with you soon",
  passportTitle: 'Your Accessibility Passport',
  urgencyLabel: 'Urgency',
  checkinTitle: 'Check-In',
  checkinMessage: 'This is the check-in screen.',
  questionXof6: 'Question {{n}} of 6',
  errorComplaintRequired: 'Please describe your concern first',
  urgencyLow: 'Low',
  urgencyMedium: 'Medium',
  urgencyHigh: 'High',
  urgencyUrgent: 'Urgent',
  checkinDiscomfort: 'How are you feeling right now?',
  checkinNeeds: 'Is there anything you need?',
  checkinLeave: 'Are you thinking of leaving?',
  needInterpreter: 'Interpreter',
  needQuietSpace: 'Quiet space',
  needInfo: 'More info',
  needMobility: 'Mobility help',
  needNone: 'None',
  leaveStaying: 'Staying',
  leaveUnsure: 'Unsure',
  leaveThinking: 'Thinking of leaving',
  thankYou: 'Thank you!',
  thankYouMessage: 'Your response has been recorded.',
  returnToWaiting: 'Returning to waiting room...',
  highContrast: 'High contrast',
  largeText: 'Large text',
  patientId: 'Patient ID',
  waitingSince: 'Waiting since check-in',
};

const FR: Record<string, string> = {
  stepXof3: 'Étape {{step}} sur 3',
  complaintQuestion: "Qu'est-ce qui vous amène aujourd'hui ?",
  complaintPlaceholder: "Décrivez ce qui vous amène aujourd'hui",
  severityQuestion: "Quel est votre niveau d'inconfort ?",
  severity1: '1 – Minimal',
  severity2: '2 – Léger',
  severity3: '3 – Modéré',
  severity4: '4 – Sévère',
  severity5: '5 – Urgence',
  accessibilityIntro: 'Rendons votre visite confortable.',
  q_mobility: 'Utilisez-vous un fauteuil roulant ou une aide à la marche ?',
  q_sensory: 'Les environnements bruyants vous causent-ils de la détresse ?',
  q_chronicPain: 'Avez-vous des douleurs qui rendent la position assise difficile ?',
  q_cognitive: "Avez-vous besoin d'un texte plus grand ?",
  q_language: 'Préférez-vous une communication plus calme ?',
  q_support: "Souhaitez-vous qu'une personne de soutien reste avec vous ?",
  yes: 'OUI',
  no: 'NON',
  languageLabel: 'Langue',
  confirmButton: "Confirmer et s'enregistrer",
  waitingTitle: 'Vous êtes enregistré !',
  waitingTime: 'Attente estimée : ~15 minutes',
  waitingMessage: 'Nous reviendrons bientôt vers vous',
  passportTitle: "Votre Passeport d'Accessibilité",
  urgencyLabel: 'Urgence',
  checkinTitle: 'Enregistrement',
  checkinMessage: "Ceci est l'écran d'enregistrement.",
  questionXof6: 'Question {{n}} sur 6',
  errorComplaintRequired: "Veuillez d'abord décrire votre problème",
  urgencyLow: 'Faible',
  urgencyMedium: 'Moyen',
  urgencyHigh: 'Élevé',
  urgencyUrgent: 'Urgent',
  checkinDiscomfort: 'Comment vous sentez-vous en ce moment ?',
  checkinNeeds: 'Avez-vous besoin de quelque chose ?',
  checkinLeave: 'Pensez-vous partir ?',
  needInterpreter: 'Interprète',
  needQuietSpace: 'Espace calme',
  needInfo: 'Plus d\'info',
  needMobility: 'Aide à la mobilité',
  needNone: 'Aucun',
  leaveStaying: 'Je reste',
  leaveUnsure: 'Incertain',
  leaveThinking: 'Je pense partir',
  thankYou: 'Merci !',
  thankYouMessage: 'Votre réponse a été enregistrée.',
  returnToWaiting: 'Retour à la salle d\'attente...',
  highContrast: 'Contraste élevé',
  largeText: 'Grand texte',
  patientId: 'ID Patient',
  waitingSince: 'En attente depuis l\'enregistrement',
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _locale = signal(
    (typeof localStorage !== 'undefined' && localStorage.getItem('patient_lang')) || 'en',
  );
  readonly locale = computed(() => this._locale());

  private readonly translations: Record<string, Record<string, string>> = { en: EN, fr: FR };

  t(key: string, params?: Record<string, string>): string {
    let val = this.translations[this._locale()]?.[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{{${k}}}`, v);
      }
    }
    return val;
  }

  setLocale(lang: string): void {
    this._locale.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('patient_lang', lang);
    }
  }
}

@Injectable({ providedIn: 'root' })
export class A11yModeService {
  readonly highContrast = signal(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('a11y_hc') === '1',
  );
  readonly largeText = signal(
    typeof sessionStorage !== 'undefined' && sessionStorage.getItem('a11y_lt') === '1',
  );

  toggleHighContrast(): void {
    const next = !this.highContrast();
    this.highContrast.set(next);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('a11y_hc', next ? '1' : '0');
    }
  }

  toggleLargeText(): void {
    const next = !this.largeText();
    this.largeText.set(next);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('a11y_lt', next ? '1' : '0');
    }
  }
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="patient-layout"
         [class.hc]="a11y.highContrast()"
         [class.lt]="a11y.largeText()">
      <header class="header">
        <div class="header-top">
          <h1>AccessER</h1>
          <div class="a11y-toggles">
            <button class="toggle-btn" (click)="a11y.toggleHighContrast()"
                    [class.on]="a11y.highContrast()"
                    [attr.aria-label]="i18n.t('highContrast')"
                    [attr.aria-pressed]="a11y.highContrast()">
              ◑
            </button>
            <button class="toggle-btn" (click)="a11y.toggleLargeText()"
                    [class.on]="a11y.largeText()"
                    [attr.aria-label]="i18n.t('largeText')"
                    [attr.aria-pressed]="a11y.largeText()">
              A+
            </button>
          </div>
        </div>
        <p class="subtitle">Patient Accessibility Intake</p>
      </header>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .patient-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #f5f7fa;
        transition: background 0.2s, color 0.2s;
      }
      /* ─── High contrast mode ─── */
      .patient-layout.hc {
        background: #fff;
        color: #000;
      }
      .patient-layout.hc .header { background: #000; }
      .patient-layout.hc .subtitle { opacity: 1; }
      /* ─── Large text mode ─── */
      .patient-layout.lt { font-size: 1.25rem; }
      .patient-layout.lt .header h1 { font-size: 1.6rem; }
      .patient-layout.lt .subtitle { font-size: 1.05rem; }

      .header {
        width: 100%;
        max-width: 480px;
        padding: 0.75rem 1rem;
        background: #0d47a1;
        color: white;
        text-align: center;
      }
      .header-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .header h1 {
        margin: 0;
        font-size: 1.3rem;
        letter-spacing: 0.5px;
      }
      .subtitle {
        margin: 0.15rem 0 0;
        opacity: 0.9;
        font-size: 0.85rem;
      }
      .a11y-toggles { display: flex; gap: 0.35rem; }
      .toggle-btn {
        width: 36px; height: 36px;
        border-radius: 8px;
        border: 2px solid rgba(255,255,255,0.5);
        background: transparent;
        color: white;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s;
      }
      .toggle-btn.on {
        background: rgba(255,255,255,0.25);
        border-color: white;
      }
      .content {
        width: 100%;
        max-width: 480px;
        flex: 1;
        padding: 1rem 1rem 2rem;
      }
    `,
  ],
})
export class PatientComponent {
  readonly i18n = inject(I18nService);
  readonly a11y = inject(A11yModeService);
}
