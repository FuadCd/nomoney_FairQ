import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="staff-layout">
      <header class="header">
        <h1>AccessER Staff Dashboard</h1>
        <p class="subtitle">Real-Time Burden Monitoring</p>
      </header>
      <main class="content">
        <p class="placeholder">Staff dashboard with Queue Equity View, patient risk indicators, and suggested actions.</p>
      </main>
      <nav class="nav">
        <a routerLink="/patient">Patient</a>
        <a routerLink="/staff" routerLinkActive="active">Staff</a>
        <a routerLink="/admin">Admin</a>
      </nav>
    </div>
  `,
  styles: [`
    .staff-layout { min-height: 100vh; display: flex; flex-direction: column; }
    .header { padding: 1.5rem; background: #1b5e20; color: white; }
    .header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { margin: 0.25rem 0 0; opacity: 0.9; font-size: 0.9rem; }
    .content { flex: 1; padding: 1.5rem; }
    .placeholder { color: #666; }
    .nav { display: flex; gap: 1rem; padding: 1rem; background: #f5f5f5; }
    .nav a { color: #2e7d32; text-decoration: none; }
    .nav a.active { font-weight: 600; }
  `],
})
export class StaffComponent {}
