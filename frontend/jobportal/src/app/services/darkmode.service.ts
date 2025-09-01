import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkmodeService {
  darkMode = signal<string>(this.getInitialMode());
  sunIcon: HTMLElement | null = null;
  moonIcon: HTMLElement | null = null;

  constructor() {
    this.applyDarkMode(this.darkMode());
  }

  private getInitialMode(): string {
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      return savedMode;
    }

    // Media Query zur Erkennung des bevorzugten Farbschemas bei Erstbesuch
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDarkMode ? 'dark' : 'light';
  }

  toggleDarkMode(): void {
    const newMode = this.darkMode() === 'dark' ? 'light' : 'dark';
    this.darkMode.set(newMode);
    localStorage.setItem('theme', newMode); // Speichern des Modus im localStorage als String 'light' oder 'dark'
    this.applyDarkMode(newMode);
    this.updateIconsAndText(newMode);
  }

  private applyDarkMode(mode: string): void {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-bs-theme', mode);
  }

  private updateIconsAndText(mode: string): void {
    if (this.sunIcon && this.moonIcon) {
      if (mode === 'dark') {
        this.sunIcon.classList.add('visually-hidden');
        this.moonIcon.classList.remove('visually-hidden');
      } else {
        this.sunIcon.classList.remove('visually-hidden');
        this.moonIcon.classList.add('visually-hidden');
      }
    }
  }
  
  initializeIconsAndText(
    sunIcon: HTMLElement | null,
    moonIcon: HTMLElement | null
  ): void {
    this.sunIcon = sunIcon;
    this.moonIcon = moonIcon;
    this.updateIconsAndText(this.darkMode());
  }
}