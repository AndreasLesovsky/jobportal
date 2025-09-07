import { Injectable } from '@angular/core';
import { apiUrl } from '../config/api.config';
import { SaveUserForm } from '../../models/save-user-form.model';

@Injectable({
  providedIn: 'root'
})
export class SaveUserService {
  private saveUserUrl = apiUrl;

  async saveUser(formData: SaveUserForm): Promise<any> {
    const form = new FormData();

    form.append('endpoint', 'save_user');

    // id nur anhängen, wenn vorhanden und null-frei (editMode)
    if (formData.id != null) {
      form.append('id', formData.id.toString());
    }

    form.append('username', formData.username);
    form.append('email', formData.email);

    if (formData.role_id != null) {
      form.append('role_id', formData.role_id.toString());
    }

    if (formData.password) {
      form.append('password', formData.password);
    }

    const response = await fetch(this.saveUserUrl, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      throw new Error('Fehler beim Speichern des Benutzers.');
    }

    return response.json();
  }
}
