import { Component, effect, inject, signal, untracked } from '@angular/core';
import { PaginationSelectFieldComponent } from "../../parts/pagination-select-field/pagination-select-field.component";
import { LogoutBtnComponent } from "../../parts/logout-btn/logout-btn.component";
import { PaginationStoreService } from '../../services/pagination-store.service';
import { LanguageService } from '../../services/language.service';
import { debounceTime, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { GetJobsService } from '../../services/get-jobs.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-job-dashboard-sidebar',
  imports: [PaginationSelectFieldComponent, LogoutBtnComponent, TranslateModule, RouterModule],
  templateUrl: './job-dashboard-sidebar.component.html',
  styleUrl: './job-dashboard-sidebar.component.css'
})
export class JobDashboardSidebarComponent {
  getJobsService = inject(GetJobsService);
  readonly pagination = inject(PaginationStoreService);

  readonly jobs = this.getJobsService.jobs;
  private readonly search = signal('');
  languageService = inject(LanguageService);
  private triggerLoad = new Subject<void>();

  constructor() {
    // beobachte aktuelle Sprache
    effect(() => {
      const lang = this.languageService.currentLang();
      // triggerLoad feuern, damit Applicants neu geladen werden
      this.triggerLoad.next();
    });

    // triggerLoad verarbeitet alles: Suche, Favoriten, Sprache
    this.triggerLoad.pipe(debounceTime(50)).subscribe(() => {
      this.getJobsService.loadJobs(
        untracked(() => this.search()),
        untracked(() => this.activeOnly()),
        untracked(() => this.languageService.currentLang())
      );
    });

    // andere Effekte für Filter/Sortierung bleiben gleich
    effect(() => {
      this.search();
      this.activeOnly();
      this.sortField();
      this.sortOrder();
      this.triggerLoad.next(); // initialer Load
    });

    // Pagination
    effect(() => {
      const count = this.getJobsService.jobs().length;
      this.pagination.setTotalItems(count);
    });
  }


  // Aktive Jobs filter
  activeOnly = signal(false);

  onActiveFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.activeOnly.set(input.checked);
    this.pagination.reset();
  }

  // Suche und Sortierung
  handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pagination.reset();
    this.search.set(input.value);  // Signal updaten
  }

  readonly sortField = this.getJobsService.sortField;
  readonly sortOrder = this.getJobsService.sortOrder;

  changeSortField(event: Event): void {
    const field = (event.target as HTMLSelectElement).value;
    this.sortField.set(field as any);
    this.pagination.reset();
  }

  toggleSortOrder(): void {
    const current = this.sortOrder();
    this.sortOrder.set(current === 'asc' ? 'desc' : 'asc');
    this.pagination.reset();
  }
}
