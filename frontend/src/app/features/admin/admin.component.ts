import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="admin-layout">
      <header class="header">
        <h1>AccessER Equity Simulator</h1>
        <p class="subtitle">Intervention Impact Modeling</p>
      </header>
      <main class="content">
        <p class="placeholder">Admin panel with intervention sliders: wait time reduction, sensory-friendly space, interpreter availability, check-in frequency.</p>
      </main>
      <nav class="nav">
        <a routerLink="/staff">Staff</a>
        <a routerLink="/admin" routerLinkActive="active">Admin</a>
        <button type="button" class="nav-signout" (click)="signOut()">Sign out</button>
      </nav>
    </div>
  `,
  styles: [`
    .admin-layout { min-height: 100vh; display: flex; flex-direction: column; }
    .header { padding: 1.5rem; background: #4a148c; color: white; }
    .header h1 { margin: 0; font-size: 1.5rem; }
    .subtitle { margin: 0.25rem 0 0; opacity: 0.9; font-size: 0.9rem; }
    .content { flex: 1; padding: 1.5rem; }
    .placeholder { color: #666; }
    .nav { display: flex; gap: 1rem; padding: 1rem; background: #f5f5f5; }
    .nav a { color: #6a1b9a; text-decoration: none; }
    .nav a.active { font-weight: 600; }
    .nav-signout { margin-left: auto; padding: 0.35rem 0.6rem; background: transparent; border: 1px solid #6a1b9a; color: #6a1b9a; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
    .nav-signout:hover { background: #6a1b9a; color: white; }
  `],
})
export class AdminComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  signOut(): void {
    this.auth.clear();
    this.router.navigate(['/']);
  }
}
