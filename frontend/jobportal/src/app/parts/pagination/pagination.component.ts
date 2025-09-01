import { Component, effect, inject } from '@angular/core';
import { PaginationStoreService } from '../../services/pagination-store.service';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent {
  pagination = inject(PaginationStoreService);

  readonly currentPage = this.pagination.currentPage;
  readonly totalPages = this.pagination.totalPages;
  readonly pagesList = this.pagination.pagesList;

  readonly previous = this.pagination.previous;
  readonly next = this.pagination.next;
  readonly changePage = this.pagination.changePage;
}