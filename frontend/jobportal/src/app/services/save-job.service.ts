import { Injectable } from '@angular/core';
import { apiUrl } from '../config/api.config';
import { SaveJobForm } from '../../models/save-job-form.model';

@Injectable({
  providedIn: 'root'
})
export class SaveJobService {
  private saveJobUrl = apiUrl;

  async saveJob(formData: SaveJobForm): Promise<any> {
    const form = new FormData();
    form.append('endpoint', 'save_job');

    if (formData.id != null) {
      form.append('id', formData.id.toString());
    }

    form.append('is_active', formData.is_active ? '1' : '0');

    // DE
    form.append('de_title', formData.de.title);
    form.append('de_location', formData.de.location);
    form.append('de_description', formData.de.description);
    form.append('de_details', formData.de.details);
    form.append('de_salary', formData.de.salary);

    // EN
    form.append('en_title', formData.en.title);
    form.append('en_location', formData.en.location);
    form.append('en_description', formData.en.description);
    form.append('en_details', formData.en.details);
    form.append('en_salary', formData.en.salary);

    const response = await fetch(this.saveJobUrl, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      throw new Error('Fehler beim Speichern des Jobs.');
    }

    return response.json();
  }
}
