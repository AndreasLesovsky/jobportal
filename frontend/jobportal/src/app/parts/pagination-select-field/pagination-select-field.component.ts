import { Component, inject } from '@angular/core';
import { PaginationStoreService } from '../../services/pagination-store.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination-select-field',
  imports: [TranslateModule],
  templateUrl: './pagination-select-field.component.html',
  styleUrl: './pagination-select-field.component.css'
})
export class PaginationSelectFieldComponent {
  pagination = inject(PaginationStoreService);

  onItemsPerPageSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);
    this.pagination.updateItemsPerPage(value);
  }

}