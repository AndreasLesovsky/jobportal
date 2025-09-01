import { Injectable, signal } from '@angular/core';
import { apiUrls } from '../config/api.config';
import { JobApplicationForm } from '../../models/job-application-form.model';

@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {
  private jobApplicationUrl = apiUrls.sendJobApplication;
  errorType = signal<'recaptchaFailed' | 'emptyFields' | 'failedUpload' | null>(null);

  async sendApplication(formData: JobApplicationForm): Promise<any> {
    if (formData.jobId === null) throw new Error('Job ID fehlt');
    if (formData.cv === null) throw new Error('CV fehlt');

    const form = new FormData();
    form.append('first_name', formData.first_name);
    form.append('last_name', formData.last_name);
    form.append('email', formData.email);
    form.append('phone', formData.phone);
    form.append('message', formData.message);
    form.append('job_id', formData.jobId.toString());
    form.append('recaptcha', formData.recaptcha);
    form.append('cv', formData.cv); // File bleibt File

    const response = await fetch(this.jobApplicationUrl, { method: 'POST', body: form });

    if (!response.ok) throw new Error('Fehler bei der API Anfrage.');

    return response.json();
  }
}