import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaginationStoreService {
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(10);
  readonly totalItems = signal(0);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage()))
  );

  readonly pagesList = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  // Getter/Setter für Sidebar-Zugriff
  get itemsPerPageValue(): number {
    return this.itemsPerPage();
  }
  set itemsPerPageValue(val: number) {
    this.itemsPerPage.set(val);
    this.currentPage.set(1); // Zurück auf erste Seite bei Änderung in der UI
  }

  changePage = (page: number) => {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  };

  previous = () => this.changePage(this.currentPage() - 1);
  next = () => this.changePage(this.currentPage() + 1);
  reset = () => this.currentPage.set(1);

  updateItemsPerPage(value: number): void {
    this.itemsPerPage.set(value);
    this.currentPage.set(1);
  }

  setTotalItems(count: number) {
    this.totalItems.set(count);
  }
}
