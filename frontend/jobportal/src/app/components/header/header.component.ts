import { AfterViewInit, Component, computed, effect, inject, Renderer2, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { DarkmodeService } from '../../services/darkmode.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { GetJobsService } from '../../services/get-jobs.service';
import { HttpParams } from '@angular/common/http';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements AfterViewInit {
  languageService = inject(LanguageService);
  darkmodeService = inject(DarkmodeService);
  getJobsService = inject(GetJobsService);
  renderer = inject(Renderer2);  // Injektion von Renderer2 in der Komponente
  themeToggler: HTMLElement | null = null;
  hamburgerIcon!: HTMLElement;

  ngAfterViewInit() {
    this.hamburgerIcon = document.querySelector('.hamburger') as HTMLElement;

    if (this.hamburgerIcon) {
      this.hamburgerIcon.addEventListener('click', () => {
        const isCollapsed = this.hamburgerIcon.classList.contains('collapsed');
        this.hamburgerIcon.classList.toggle('is-active', !isCollapsed);
      });
    }
  }

  ngOnInit(): void {
    // Initialisiere DOM-Elemente und übergebe sie an den DarkmodeService
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const themeText = document.getElementById('theme-text');

    // Initialisiere den Service mit den Icons und Text
    this.darkmodeService.initializeIconsAndText(
      sunIcon as HTMLElement,
      moonIcon as HTMLElement
    );

    this.themeToggler = document.getElementById('theme-toggler');
  }

  toggleTheme(): void {
    this.darkmodeService.toggleDarkMode();
  }

  // Nav Collapse bei Klick auf Links
  hideCollapse() {
    const collapseElements = [
      document.getElementById('mainNavbarContent')
    ];
  
    let shouldRemoveActive = false;
  
    collapseElements.forEach((collapseElement) => {
      if (collapseElement && collapseElement.classList.contains('show')) {
        const bsCollapse = new (window as any).bootstrap.Collapse(collapseElement, {
          toggle: false,
        });
  
        bsCollapse.hide();
        shouldRemoveActive = true;
      }
    });
  
    if (shouldRemoveActive && this.hamburgerIcon?.classList.contains('is-active')) {
      setTimeout(() => {
        this.hamburgerIcon?.classList.remove('is-active');
      }, 100);
    }
  }
  
}