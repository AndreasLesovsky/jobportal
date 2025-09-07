import { effect, Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Applicant } from '../../models/applicant.model';
import { catchError, of } from 'rxjs';
import { LanguageService } from './language.service';
import { apiUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })

export class GetApplicantsService {
  private readonly http = inject(HttpClient);
  private readonly getApplicantsUrl = apiUrl;
  readonly applicants = signal<Applicant[]>([]);
  readonly sortField = signal<'created_at' | 'first_name' | 'last_name' | 'email'>('created_at');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  private languageService = inject(LanguageService);

  loadApplicants(searchTerm?: string, favoriteOnly?: boolean, lang: string = this.languageService.currentLang()): void {
    let params = new HttpParams()
      .set('endpoint', 'get_applicants')
      .set('sortBy', this.sortField())
      .set('sortDir', this.sortOrder())
      .set('lang', lang);

    if (searchTerm?.trim()) {
      params = params.set('q', searchTerm.trim());
    }

    if (favoriteOnly) {
      params = params.set('favoriteOnly', '1');
    }

    this.http.get<Applicant[]>(this.getApplicantsUrl, { params })
      .pipe(
        catchError(err => {
          console.error('Fehler beim Laden der Bewerber:', err);
          return of([]);
        })
      )
      .subscribe(data => this.applicants.set(data));
  }

}
