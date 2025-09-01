import { Component, computed, effect, inject, Renderer2 } from '@angular/core';
import { GetApplicantsService } from '../../services/get-applicants.service';
import { DownloadCvService } from '../../services/download-cv.service';
import { CommonModule } from '@angular/common';
import { Applicant } from '../../../models/applicant.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { PaginationComponent } from "../../parts/pagination/pagination.component";
import { PaginationStoreService } from '../../services/pagination-store.service';
import { DeleteEntityService } from '../../services/delete-entity.service';
import { ToggleEntityService } from '../../services/toggle-entity.service';

@Component({
  selector: 'app-applicant-list',
  imports: [CommonModule, TranslateModule, PaginationComponent],
  templateUrl: './applicant-list.component.html',
  styleUrl: './applicant-list.component.css'
})
export class ApplicantListComponent {
  languageService = inject(LanguageService);
  downloadService = inject(DownloadCvService);
  deleteService = inject(DeleteEntityService);
  toggleEntityService = inject(ToggleEntityService);
  private renderer = inject(Renderer2);
  readonly getApplicantsService = inject(GetApplicantsService);
  readonly applicants = this.getApplicantsService.applicants;
  readonly pagination = inject(PaginationStoreService);
  readonly paginatedApplicants = computed(() => {
    const all = this.applicants();
    const page = this.pagination.currentPage();
    const perPage = this.pagination.itemsPerPage();
    const start = (page - 1) * perPage;
    return all.slice(start, start + perPage);
  });

  constructor() {
    effect(() => {
      this.pagination.setTotalItems(this.applicants().length);
    });
  }

  ngOnDestroy(): void {
    this.pagination.reset();
  }

  toggleFavorite(applicant: Applicant, starIcon: HTMLElement) {
    const newState = !applicant.is_favorite;

    this.toggleEntityService.toggleEntity('tbl_applicants', 'is_favorite', applicant.id, newState ? 1 : 0)
      .subscribe({
        next: res => {
          if (res.success) {
            applicant.is_favorite = newState;

            // Animation wie oben
            this.renderer.removeClass(starIcon, 'star-animate');
            void starIcon.offsetWidth;
            this.renderer.addClass(starIcon, 'star-animate');

            setTimeout(() => this.renderer.removeClass(starIcon, 'star-animate'), 400);
          }
        },
        error: err => console.error('Netzwerkfehler', err)
      });
  }

}
