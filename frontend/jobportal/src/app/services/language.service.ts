import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly STORAGE_KEY = 'language';
  readonly currentLang = signal<string>(this.translate.currentLang);

  constructor() {
    registerLocaleData(localeDe);
    registerLocaleData(localeEn);

    const savedLang = localStorage.getItem(this.STORAGE_KEY);
    if (savedLang) {
      this.translate.use(savedLang);
      this.currentLang.set(savedLang);
    } else {
      this.translate.use('de');
      this.currentLang.set('de');
    }
  }

  translateText(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.currentLang.set(lang);
  }

  get locale(): string {
    return this.currentLang() === 'de' ? 'de-DE' : 'en-US';
  }
}
