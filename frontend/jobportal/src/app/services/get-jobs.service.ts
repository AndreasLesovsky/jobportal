import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Job } from '../../models/job.model';
import { LanguageService } from './language.service';
import { apiUrls } from '../config/api.config';

@Injectable({ providedIn: 'root' })

export class GetJobsService {
  readonly http = inject(HttpClient);
  private readonly getJobsUrl = apiUrls.getJobs;
  readonly jobs = signal<Job[]>([]);
  readonly sortField = signal<'created_at' | 'title' | 'location' | 'salary'>('created_at');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  private languageService = inject(LanguageService);

  loadJobs(searchTerm?: string, activeOnly?: boolean, lang: string = this.languageService.currentLang()): void {
    let params = new HttpParams()
      .set('sortBy', this.sortField())
      .set('sortDir', this.sortOrder())
      .set('lang', lang);

    if (searchTerm?.trim()) {
      params = params.set('q', searchTerm.trim());
    }

    if (activeOnly) {
      params = params.set('activeOnly', '1');
    }

    this.http.get<Job[]>(this.getJobsUrl, { params })
      .pipe(
        catchError(err => {
          console.error('Fehler beim Laden der Jobs:', err);
          return of([]);
        })
      )
      .subscribe(data => this.jobs.set(data));
  }
}