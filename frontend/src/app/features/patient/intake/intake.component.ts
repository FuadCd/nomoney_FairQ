import { Component } from '@angular/core';

@Component({
  selector: 'app-intake',
  standalone: true,
  template: `
    <section class="intake-card">
      <h2>Accessibility Intake</h2>
      <p>Complete the accessibility-focused intake to generate your personalized burden curve. Designed for high contrast, large text, and one-handed operation.</p>
      <ul>
        <li>Mobility support</li>
        <li>Noise/light sensitivity</li>
        <li>Language preference</li>
        <li>Chronic conditions affecting wait tolerance</li>
        <li>Communication or cognitive needs</li>
      </ul>
    </section>
  `,
  styles: [`
    .intake-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      max-width: 600px;
    }
    .intake-card h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
    .intake-card p { color: #444; line-height: 1.5; margin: 0 0 1rem; }
    .intake-card ul { margin: 0; padding-left: 1.25rem; color: #555; }
  `],
})
export class IntakeComponent {}
