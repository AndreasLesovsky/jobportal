import { Component, computed, effect, inject, signal, WritableSignal } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private loginService = inject(LoginService);
  private router = inject(Router);

  formData = {
    email: '',
    password: ''
  };

  isLoading = signal(false);
  submitSuccess = signal<boolean | null>(null);
  error = signal<boolean>(false);

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async onSubmit(): Promise<void> {
    this.error.set(false);
    this.submitSuccess.set(null);

    if (!this.formData.email || !this.formData.password) {
      this.error.set(true);
      this.submitSuccess.set(false);
      return;
    }

    this.isLoading.set(true);
    const start = Date.now();

    try {
      const success = await this.loginService.login(
        this.formData.email,
        this.formData.password
      );

      this.submitSuccess.set(success);

      if (!success) {
        this.error.set(true);
        this.isLoading.set(false);
        return; // Keine Wartezeit, keine Weiterleitung
      }

      // Erfolg: mindestens 2 Sekunden Loading anzeigen
      const elapsed = Date.now() - start;
      const remaining = 2000 - elapsed;
      if (remaining > 0) {
        await this.delay(remaining);
      }
      this.isLoading.set(false);
      this.router.navigate(['/dashboard']);
    } catch {
      this.error.set(true);
      this.submitSuccess.set(false);
      this.isLoading.set(false);
    }
  }
}
