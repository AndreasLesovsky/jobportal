import { Injectable } from '@angular/core';
import { apiUrls } from '../config/api.config';
import { ContactForm } from '../../models/contact-form.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private contactUrl = apiUrls.sendContactMail;

  async sendMessage(formData: ContactForm): Promise<any> {
    const response = await fetch(this.contactUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Fehler beim Senden der Nachricht.');
    }

    return response.json();
  }
}