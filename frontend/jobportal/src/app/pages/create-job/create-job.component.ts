import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetJobsService } from '../../services/get-jobs.service';
import { FormsModule } from '@angular/forms';
import { SaveJobService } from '../../services/save-job.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-create-job',
  imports: [FormsModule, TranslateModule],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.css'
})
export class CreateJobComponent {
  route = inject(ActivatedRoute);
  getJobsService = inject(GetJobsService);
  saveJobService = inject(SaveJobService);
  isEditMode = signal(false);
  submitSuccess = signal<boolean | null>(null);
  errorType = signal<'empty' | 'unchanged' | 'serverError' | null>(null);
  isLoading = signal(false);
  private originalJob: any = null;
  private deLoaded = signal(false);
  private enLoaded = signal(false);

  formData = {
    id: null as number | null,
    is_active: false, // boolean
    de: { title: '', location: '', description: '', details: '', salary: '' },
    en: { title: '', location: '', description: '', details: '', salary: '' }
  };

  // Warn-Flags pro Feld
  needsTranslation = {
    title: false,
    location: false,
    description: false,
    details: false,
    salary: false
  } as Record<'title' | 'location' | 'description' | 'details' | 'salary', boolean>;

  get hasTranslationWarnings(): boolean {
    return Object.values(this.needsTranslation).some(v => v);
  }

  // DE geändert → warnen
  onDeChange(field: keyof typeof this.needsTranslation) {
    if (!this.isEditMode() || !this.originalJob) return;
    const deChanged = (this.formData.de[field] ?? '').trim() !== (this.originalJob.de[field] ?? '').trim();
    const enChanged = (this.formData.en[field] ?? '').trim() !== (this.originalJob.en[field] ?? '').trim();
    this.needsTranslation[field] = deChanged && !enChanged;
  }

  // EN geändert → warnen
  onEnChange(field: keyof typeof this.needsTranslation) {
    if (!this.isEditMode() || !this.originalJob) return;
    const enChanged = (this.formData.en[field] ?? '').trim() !== (this.originalJob.en[field] ?? '').trim();
    const deChanged = (this.formData.de[field] ?? '').trim() !== (this.originalJob.de[field] ?? '').trim();
    this.needsTranslation[field] = enChanged && !deChanged;
  }

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('jobId'));
    if (!id) return;

    this.isEditMode.set(true);
    this.formData.id = id;

    // Beide Sprachen laden
    this.getJobsService.loadJobs('', undefined, 'de');
    this.getJobsService.loadJobs('', undefined, 'en');

    // DE in formData mappen
    effect(() => {
      const deJob = this.getJobsService.jobs().find(j => j.id === id && j.lang === 'de');
      if (!deJob) return;
      this.formData.is_active = deJob.is_active;
      this.formData.de = {
        title: deJob.title,
        location: deJob.location,
        description: deJob.description,
        details: deJob.details,
        salary: deJob.salary
      };
      this.deLoaded.set(true);
    });

    // EN in formData mappen
    effect(() => {
      const enJob = this.getJobsService.jobs().find(j => j.id === id && j.lang === 'en');
      if (!enJob) return;
      this.formData.en = {
        title: enJob.title,
        location: enJob.location,
        description: enJob.description,
        details: enJob.details,
        salary: enJob.salary
      };
      this.enLoaded.set(true);
    });

    // originalJob setzen, sobald beide da sind
    effect(() => {
      if (this.deLoaded() && this.enLoaded() && !this.originalJob) {
        this.originalJob = JSON.parse(JSON.stringify(this.formData));
      }
    });
  }

  async onSubmit() {
    // Pflichtfelder nur im Create-Mode
    if (!this.isEditMode()) {
      const { de, en } = this.formData;
      const missing =
        !de.title || !de.location || !de.description || !de.details || !de.salary ||
        !en.title || !en.location || !en.description || !en.details || !en.salary;
      if (missing) {
        this.errorType.set('empty');
        this.submitSuccess.set(false);
        return;
      }
    }

    // Im Edit-Mode: unverändert?
    if (this.isEditMode() && this.originalJob &&
      JSON.stringify(this.formData) === JSON.stringify(this.originalJob)) {
      this.errorType.set('unchanged');
      this.submitSuccess.set(false);
      return;
    }

    this.isLoading.set(true);
    const start = Date.now();

    try {
      await this.saveJobService.saveJob(this.formData);

      const duration = Date.now() - start;
      const remaining = 2000 - duration;

      setTimeout(() => {
        this.isLoading.set(false);
        this.submitSuccess.set(true);
        this.errorType.set(null);

        // Nach erfolgreichem Save neuen „Originalzustand“ setzen
        this.originalJob = JSON.parse(JSON.stringify(this.formData));
        
        // Alle Warnungen zurücksetzen
        Object.assign(this.needsTranslation, {
          title: false,
          location: false,
          description: false,
          details: false,
          salary: false
        });
      }, Math.max(remaining, 0));
    } catch (e) {
      console.error(e);

      const duration = Date.now() - start;
      const remaining = 2000 - duration;

      setTimeout(() => {
        this.isLoading.set(false);
        this.submitSuccess.set(false);
        this.errorType.set('serverError');
      }, Math.max(remaining, 0));
    }
  }
}