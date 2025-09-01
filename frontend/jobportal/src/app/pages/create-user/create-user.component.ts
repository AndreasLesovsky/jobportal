import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaveUserService } from '../../services/save-user.service';
import { ActivatedRoute } from '@angular/router';
import { GetUsersService } from '../../services/get-users.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-user',
  imports: [FormsModule, TranslateModule, CommonModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  route = inject(ActivatedRoute);
  getUserService = inject(GetUsersService);
  saveUserService = inject(SaveUserService);
  isEditMode = signal(false);
  submitSuccess = signal<boolean | null>(null);
  errorType = signal<'empty' | 'invalidEmail' | 'serverError' | 'unchanged' | null>(null);
  isLoading = signal(false);

  // Originaldaten zum Vergleich bei EditMode
  private originalUser: {
    username: string;
    email: string;
    role_id: number | null;
  } | null = null;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('userId'));
    if (id) {
      const user = this.getUserService.users().find(u => u.id === id);
      if (user) {
        this.isEditMode.set(true);
        this.formData.id = user.id;
        this.formData.username = user.username;
        this.formData.email = user.email;
        this.formData.role_id = user.role_id;

        // Original speichern
        this.originalUser = {
          username: user.username,
          email: user.email,
          role_id: user.role_id,
        };
      }
    }

    if (!this.isEditMode()) {
      this.formData.role_id = 1; // Admin vorausgewählt
    }
  }

  formData = {
    id: null as number | null,
    username: '',
    email: '',
    password: '',
    role_id: null as number | null
  };

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  async onSubmit() {
    const { username, email, password, role_id } = this.formData;

    // Passwort nur Pflicht wenn kein EditMode
    if (!username || !email || !role_id || (!this.isEditMode() && !password)) {
      this.errorType.set('empty');
      this.submitSuccess.set(false);
      return;
    }

    if (!this.validateEmail(email)) {
      this.errorType.set('invalidEmail');
      this.submitSuccess.set(false);
      return;
    }

    // Prüfen ob im EditMode und keine Änderung erfolgt ist
    if (this.isEditMode() && this.originalUser) {
      const unchanged =
        this.originalUser.username === username &&
        this.originalUser.email === email &&
        this.originalUser.role_id === role_id &&
        !password; // Passwort leer heißt keine Änderung

      if (unchanged) {
        this.errorType.set('unchanged');
        this.submitSuccess.set(false);
        return;
      }
    }

    this.isLoading.set(true);
    const start = Date.now();

    try {
      await this.saveUserService.saveUser(this.formData);

      const duration = Date.now() - start;
      const remaining = 2000 - duration;

      setTimeout(() => {
        this.isLoading.set(false);
        this.submitSuccess.set(true);
        this.errorType.set(null);
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
