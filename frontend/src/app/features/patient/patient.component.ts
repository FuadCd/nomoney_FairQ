import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="patient-layout">
      <header class="header">
        <h1>AccessER</h1>
        <p class="subtitle">Patient Accessibility Intake</p>
      </header>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
      <nav class="nav">
        <a routerLink="/patient" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Intake
        </a>
        <a routerLink="/staff">Staff</a>
        <a routerLink="/admin">Admin</a>
      </nav>
    </div>
  `,
  styles: [`
    .patient-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 1.5rem;
      background: #0d47a1;
      color: white;
    }
    .header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { margin: 0.25rem 0 0; opacity: 0.9; font-size: 0.9rem; }
    .content { flex: 1; padding: 1.5rem; }
    .nav {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
    }
    .nav a { color: #1565c0; text-decoration: none; }
    .nav a.active { font-weight: 600; }
  `],
})
export class PatientComponent {}
