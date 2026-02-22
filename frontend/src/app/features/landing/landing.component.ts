import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div class="flex items-center justify-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <h1 class="text-2xl font-bold text-gray-900">AccessER</h1>
          </div>
          <p class="text-sm text-gray-600 text-center mb-6">Accessibility-Adjusted Emergency Room Burden</p>

          <div class="space-y-3">
            <input
              id="hospital-code"
              type="text"
              [(ngModel)]="hospitalCode"
              placeholder="Hospital Code"
              aria-label="Hospital code"
              (keydown.enter)="submitCode()"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              (click)="submitCode()"
              class="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Staff access
            </button>
            @if (codeError) {
              <p class="text-sm text-red-600">{{ codeError }}</p>
            }
          </div>

          <div class="flex items-center gap-4 my-6">
            <span class="flex-1 h-px bg-gray-200"></span>
            <span class="text-sm text-gray-500">or</span>
            <span class="flex-1 h-px bg-gray-200"></span>
          </div>

          <button
            type="button"
            (click)="goAsPatient()"
            class="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
          >
            I'm a patient
          </button>
        </div>
      </div>
    </div>
  `,
})
export class LandingComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  hospitalCode = '';
  codeError = '';

  submitCode(): void {
    this.codeError = '';
    const raw = this.hospitalCode.trim();
    if (!raw) {
      this.codeError = 'Invalid Code.';
      return;
    }
    if (this.auth.setStaffSession(raw)) {
      this.router.navigate(['/staff']);
    } else {
      this.codeError = 'Invalid Code.';
    }
  }

  goAsPatient(): void {
    this.auth.setPatientSession();
    this.router.navigate(['/patient']);
  }
}
