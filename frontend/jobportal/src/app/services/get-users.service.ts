import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { apiUrls } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class GetUsersService {
  private readonly http = inject(HttpClient);
  private readonly getUsersUrl = apiUrls.getUsers;
  readonly users = signal<User[]>([]);
  readonly sortField = signal<'created_at' | 'username' | 'email' | 'role_name'>('created_at');
  readonly sortOrder = signal<'asc' | 'desc'>('desc');
  readonly roleFilter = signal<string>(''); // z. B. 'admin', 'hr', wenn leer werden alle Rollen angezeigt

  loadUsers(searchTerm?: string, role?: string): void {
    let params = new HttpParams()
      .set('sortBy', this.sortField())
      .set('sortDir', this.sortOrder());

    if (searchTerm?.trim()) {
      params = params.set('q', searchTerm.trim());
    }

    const effectiveRole = role?.trim() || this.roleFilter();
    if (effectiveRole) {
      params = params.set('role', effectiveRole);
    }

    this.http.get<User[]>(this.getUsersUrl, { params })
      .pipe(
        catchError(err => {
          console.error('Fehler beim Laden der Benutzer:', err);
          return of([]);
        })
      )
      .subscribe(data => this.users.set(data));
  }
}