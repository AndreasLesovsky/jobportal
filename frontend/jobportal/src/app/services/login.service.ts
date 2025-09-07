import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })

export class LoginService {
  private http = inject(HttpClient);
  loginSuccess = signal<boolean | null>(null);
  role = signal<string | null>(null);
  loginUrl = apiUrl;
  checkSessionUrl = apiUrl;
  logoutUrl = apiUrl;

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; user?: { role?: string } }>(
          this.loginUrl,
          { endpoint: 'login', email, password },
          { withCredentials: true }
        )
      );

      const success = response?.success ?? false;
      this.loginSuccess.set(success);

      if (success && response.user?.role) {
        this.role.set(response.user.role);
      }

      return success;
    } catch (error) {
      this.loginSuccess.set(false);
      return false;
    }
  }

  async checkSession(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; role?: string }>(
          `${this.checkSessionUrl}?endpoint=check_session`,
          { withCredentials: true }
        )
      );

      const success = response?.success ?? false;
      this.loginSuccess.set(success);

      if (success && response.role) {
        this.role.set(response.role);
      }

      return success;
    } catch (error) {
      this.loginSuccess.set(false);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(
          this.logoutUrl,
          { endpoint: 'logout' },
          { withCredentials: true }
        )
      );
      if (response.success) {
        this.loginSuccess.set(null);
      }
      return response.success;
    } catch {
      return false;
    }
  }
}