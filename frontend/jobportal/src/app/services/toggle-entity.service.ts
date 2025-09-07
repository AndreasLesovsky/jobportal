import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiUrl } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ToggleEntityService {
  private http = inject(HttpClient);
  private toggleUrl = apiUrl;

  toggleEntity(table: 'tbl_jobs' | 'tbl_applicants', field: 'is_active' | 'is_favorite', id: number, value: 0 | 1) {
    return this.http.post<{ success: boolean }>(this.toggleUrl, { endpoint: 'toggle_entity', table, field, id, value });
  }
}