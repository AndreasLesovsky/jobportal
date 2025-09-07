import { Injectable } from '@angular/core';
import { apiUrl } from '../config/api.config';
import { ContactForm } from '../../models/contact-form.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {

  async sendMessage(formData: ContactForm): Promise<any> {
    // endpoint hinzufügen
    const payload = { ...formData, endpoint: 'send_contact_mail' };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Fehler beim Senden der Nachricht.');
    }

    return response.json();
  }

}