import { Component, computed, effect, inject, signal, Signal, untracked } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from "../../parts/pagination/pagination.component";
import { LanguageService } from '../../services/language.service';
import { GetJobsService } from '../../services/get-jobs.service';
import { PaginationStoreService } from '../../services/pagination-store.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-list',
  imports: [TranslateModule, RouterModule, PaginationComponent, CommonModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.css'
})
export class JobListComponent {
  languageService = inject(LanguageService);
  readonly getJobsService = inject(GetJobsService);
  readonly jobs = this.getJobsService.jobs;
  readonly pagination = inject(PaginationStoreService);

  readonly paginatedJobs = computed(() => {
    const all = this.jobs();
    const page = this.pagination.currentPage();
    const perPage = this.pagination.itemsPerPage();
    const start = (page - 1) * perPage;
    return all.slice(start, start + perPage);
  });

  constructor() {
    effect(() => {
      this.languageService.currentLang();
      this.search();
      this.sortField();
      this.sortOrder();

      this.getJobsService.loadJobs(
        this.search(),
        true, // immer nur aktive Jobs
      );
    });

    effect(() => {
      this.pagination.setTotalItems(this.jobs().length);
    });
  }

  ngOnDestroy(): void {
    this.pagination.reset();
  }

  private readonly search = signal('');

  handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pagination.reset();
    this.search.set(input.value);
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