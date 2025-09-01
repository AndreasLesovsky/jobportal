import { Component, effect, inject, signal, untracked } from '@angular/core';
import { GetApplicantsService } from '../../services/get-applicants.service';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Subject } from 'rxjs';
import { PaginationStoreService } from '../../services/pagination-store.service';
import { FormsModule } from '@angular/forms';
import { LogoutBtnComponent } from "../../parts/logout-btn/logout-btn.component";
import { PaginationSelectFieldComponent } from "../../parts/pagination-select-field/pagination-select-field.component";
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-applicant-dashboard-sidebar',
  imports: [TranslateModule, FormsModule, LogoutBtnComponent, PaginationSelectFieldComponent],
  templateUrl: './applicant-dashboard-sidebar.component.html',
  styleUrl: './applicant-dashboard-sidebar.component.css'
})
export class ApplicantDashboardSidebarComponent {
  getApplicantsService = inject(GetApplicantsService);
  languageService = inject(LanguageService);
  readonly pagination = inject(PaginationStoreService);
  readonly applicants = this.getApplicantsService.applicants;
  private readonly search = signal('');
  private triggerLoad = new Subject<void>();
  favoriteOnly = signal(false);

  constructor() {
    effect(() => {
      const lang = this.languageService.currentLang();
      this.triggerLoad.next();
    });

    this.triggerLoad.pipe(debounceTime(50)).subscribe(() => {
      this.getApplicantsService.loadApplicants(
        untracked(() => this.search()),
        untracked(() => this.favoriteOnly()),
        untracked(() => this.languageService.currentLang())
      );
    });

    effect(() => {
      this.search();
      this.favoriteOnly();
      this.sortField();
      this.sortOrder();
      this.triggerLoad.next();
    });

    effect(() => {
      const count = this.getApplicantsService.applicants().length;
      this.pagination.setTotalItems(count);
    });
  }

  onFavoriteFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.favoriteOnly.set(input.checked);
    this.pagination.reset();
  }

  handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pagination.reset();
    this.search.set(input.value);
  }

  readonly sortField = this.getApplicantsService.sortField;
  readonly sortOrder = this.getApplicantsService.sortOrder;

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