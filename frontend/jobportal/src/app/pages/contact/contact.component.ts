import { Component, inject, signal } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RecaptchaComponent } from '../../parts/recaptcha/recaptcha.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, TranslateModule, RecaptchaComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  private contactService = inject(ContactService);
  submitSuccess = signal<boolean | null>(null);
  errorType = signal<'empty' | 'invalidEmail' | 'recaptchaMissing' | 'serverError' | null>(null);
  serverErrorType = signal<'recaptchaFailed' | 'emptyFields' | null>(null);
  isLoading = signal(false);

  formData = {
    name: '',
    email: '',
    message: '',
  };

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  async onSubmit() {
    const { name, email, message } = this.formData;
    const recaptcha = grecaptcha.getResponse();

    if (!name || !email || !message) {
      this.errorType.set('empty');
      this.submitSuccess.set(false);
      return;
    }

    if (!this.validateEmail(email)) {
      this.errorType.set('invalidEmail');
      this.submitSuccess.set(false);
      return;
    }

    if (!recaptcha) {
      this.errorType.set('recaptchaMissing');
      this.submitSuccess.set(false);
      return;
    }

    this.isLoading.set(true);
    const start = Date.now();

    try {
      await this.contactService.sendMessage({ ...this.formData, recaptcha });

      const duration = Date.now() - start;
      const remaining = 2000 - duration;

      setTimeout(() => {
        this.isLoading.set(false);
        this.submitSuccess.set(true);
        this.errorType.set(null);
        this.serverErrorType.set(null);
      }, Math.max(remaining, 0));
    } catch (err: any) {
      console.error(err);

      const duration = Date.now() - start;
      const remaining = 2000 - duration;

      setTimeout(() => {
        this.isLoading.set(false);
        this.submitSuccess.set(false);

        if (err instanceof HttpErrorResponse && err.status === 400) {
          this.serverErrorType.set(err.error?.errorType ?? null);
        } else {
          this.errorType.set('serverError');
          this.serverErrorType.set(null);
        }
      }, Math.max(remaining, 0));
    }
  }
}