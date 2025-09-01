import { Component, AfterViewInit } from '@angular/core';
import { recaptchaConfig } from '../../config/recaptcha.config';

@Component({
  selector: 'app-recaptcha',
  imports: [],
  templateUrl: './recaptcha.component.html',
  styleUrl: './recaptcha.component.css'
})
export class RecaptchaComponent implements AfterViewInit {
  siteKey = recaptchaConfig.siteKey;
  
  ngAfterViewInit(): void {
    const renderRecaptcha = () => {
      if ((window as any).grecaptcha) {
        grecaptcha.render('recaptcha-container', {
          sitekey: this.siteKey,
        });
      } else {
        setTimeout(renderRecaptcha, 100);
      }
    };
    renderRecaptcha();
  }
}
