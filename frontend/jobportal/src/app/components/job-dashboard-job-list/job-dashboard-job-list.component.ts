import { Component, computed, effect, inject, Renderer2 } from '@angular/core';
import { PaginationComponent } from "../../parts/pagination/pagination.component";
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { DeleteEntityService } from '../../services/delete-entity.service';
import { GetJobsService } from '../../services/get-jobs.service';
import { PaginationStoreService } from '../../services/pagination-store.service';
import { Job } from '../../../models/job.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToggleEntityService } from '../../services/toggle-entity.service';

@Component({
  selector: 'app-job-dashboard-job-list',
  imports: [PaginationComponent, TranslateModule, CommonModule, RouterModule],
  templateUrl: './job-dashboard-job-list.component.html',
  styleUrl: './job-dashboard-job-list.component.css'
})
export class JobDashboardJobListComponent {
  languageService = inject(LanguageService);
  deleteService = inject(DeleteEntityService);
  toggleEntityService = inject(ToggleEntityService);
  private renderer = inject(Renderer2);
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
      this.pagination.setTotalItems(this.jobs().length);
    });
  }

  ngOnDestroy(): void {
    this.pagination.reset();
  }

  toggleActive(job: Job, flagIcon: HTMLElement) {
    const newState = !job.is_active;

    this.toggleEntityService.toggleEntity('tbl_jobs', 'is_active', job.id, newState ? 1 : 0)
      .subscribe({
        next: res => {
          if (res.success) {
            job.is_active = newState;

            // Animation erzwingen
            this.renderer.removeClass(flagIcon, 'flag-animate');
            void flagIcon.offsetWidth; // ← forced reflow
            this.renderer.addClass(flagIcon, 'flag-animate');

            setTimeout(() => {
              this.renderer.removeClass(flagIcon, 'flag-animate');
            }, 400);
          }
        },
        error: err => console.error('Netzwerkfehler', err)
      });
  }

}
