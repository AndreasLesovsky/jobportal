import { Component, inject, signal } from '@angular/core';
import { SecondsToMmSsPipe } from '../../pipes/seconds-to-mm-ss.pipe';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-logout-btn',
  imports: [SecondsToMmSsPipe, TranslateModule],
  templateUrl: './logout-btn.component.html',
  styleUrl: './logout-btn.component.css'
})
export class LogoutBtnComponent {
  // LogoutBtnComponent enthält komplette Session Timer Logik, wird in Zukunft eventuell in eine eigene Komponente ausgelagert

  private loginService = inject(LoginService);
  private router = inject(Router);
  private sessionDuration = 24 * 60;
  remainingTime = signal(this.sessionDuration);
  errorType = signal<'failedApiCall' | 'serverError' | null>(null);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private clickListener = this.handleDocumentClick.bind(this);
  private lastSessionCheck = 0;
  isLoading = signal(false);

  ngOnInit(): void {
    if (!this.router.url.includes('/dashboard')) return;
    this.startSessionTimer();
    document.addEventListener('click', this.clickListener);

  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Bei Klick auf dem Document Objekt (irgednwo auf der Page) innerhalb der /dashboard Route oder initialem Laden der Komponente
  //  wird die Session erneuert und der Timer zurückgesetzt
  private handleDocumentClick(): void {
    if (this.router.url.includes('/dashboard')) {
      this.refreshSessionIfValid();
    }
  }

  async refreshSessionIfValid() {
    const now = Date.now();
    if (now - this.lastSessionCheck < 5000) return;

    this.lastSessionCheck = now;

    const stillValid = await this.loginService.checkSession();
    if (stillValid) {
      this.resetTimer();
    } else {
      this.logout();
    }
  }

  startSessionTimer(): void {
    this.intervalId = setInterval(() => {
      const current = this.remainingTime();
      if (current <= 1) {
        this.logout();
      } else {
        this.remainingTime.set(current - 1);
      }
    }, 1000);
  }

  resetTimer(): void {
    this.remainingTime.set(this.sessionDuration);
  }

  async logout() {
    this.isLoading.set(true);
    const start = Date.now();

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    try {
      const success = await this.loginService.logout();

      if (!success) {
        this.errorType.set('failedApiCall');
        this.isLoading.set(false);
        return;
      }

      const elapsed = Date.now() - start;
      const remaining = 1000 - elapsed;
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      this.isLoading.set(false);
      this.errorType.set(null);
      this.router.navigate(['/login']);
    } catch {
      this.errorType.set('serverError');
      this.isLoading.set(false);
    }
  }

}