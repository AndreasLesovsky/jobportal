import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { JobApplicationService } from '../../services/job-application.service';
import { GetJobsService } from '../../services/get-jobs.service';
import { LanguageService } from '../../services/language.service';
import { RecaptchaComponent } from '../../parts/recaptcha/recaptcha.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-application-form',
  imports: [FormsModule, TranslateModule, RecaptchaComponent],
  templateUrl: './application-form.component.html',
  styleUrl: './application-form.component.css'
})
export class ApplicationFormComponent {
  route = inject(ActivatedRoute);
  applicationService = inject(JobApplicationService);
  languageService = inject(LanguageService);
  private getJobsService = inject(GetJobsService);
  jobs = this.getJobsService.jobs;
  submitSuccess = signal<boolean | null>(null);
  errorType = signal<'empty' | 'cvEmpty' | 'invalidJobId' | 'invalidEmail' | 'recaptchaMissing' | 'serverError' | null>(null);
  serverErrorType = signal<'recaptchaFailed' | 'emptyFields' | 'failedUpload' | null>(null);
  isLoading = signal(false);
  jobId = signal<number>(
    Number(this.route.snapshot.paramMap.get('jobId'))
  );

  formData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    message: '',
    cv: null as File | null,
    jobId: this.jobId()
  };

  constructor() {
    effect(() => {
      const lang = this.languageService.currentLang();
      const id = this.jobId();

      if (id) {
        this.getJobsService.loadJobs(undefined, true, lang);
      }
    });
  }

  jobTitle = computed(() => {
    const id = this.jobId();
    if (id === null) return null;

    const lang = this.languageService.currentLang();
    const job = this.jobs().find(j => j.id === id);
    return job?.title ?? null;
  });

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  validateJobId(jobId: number | null): boolean {
    if (jobId === null) return false;
    return this.jobs().some(job => job.id === jobId);
  }

  handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && file.name.endsWith('.pdf') && file.type === 'application/pdf') {
      this.formData.cv = file;
    } else {
      this.formData.cv = null;
    }
  }

  clearFile() {
    this.formData.cv = null;
    const input = document.getElementById('cv') as HTMLInputElement;
    if (input) input.value = '';
  }

  async onSubmit() {
    const { first_name, last_name, email, phone, message, cv } = this.formData;
    const recaptcha = grecaptcha.getResponse();

    if (!first_name || !last_name || !email || !message || !phone) {
      this.errorType.set('empty');
      this.submitSuccess.set(false);
      return;
    }

    if (!cv) {
      this.errorType.set('cvEmpty');
      this.submitSuccess.set(false);
      return
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

    if (!this.validateJobId(this.jobId())) {
      this.errorType.set('invalidJobId');
      this.submitSuccess.set(false);
      return;
    }

    this.errorType.set(null);
    this.submitSuccess.set(null);
    this.isLoading.set(true);
    const start = Date.now();

    try {
      await this.applicationService.sendApplication({ ...this.formData, recaptcha });

      const duration = Date.now() - start;
      const remaining = 2000 - duration;

      setTimeout(() => {
        this.isLoading.set(false);
        this.submitSuccess.set(true);
      }, Math.max(remaining, 0));
    } catch (err: any) {
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