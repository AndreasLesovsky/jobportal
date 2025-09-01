import { Component, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GetUsersService } from '../../services/get-users.service';
import { LogoutBtnComponent } from "../../parts/logout-btn/logout-btn.component";
import { PaginationStoreService } from '../../services/pagination-store.service';
import { PaginationSelectFieldComponent } from "../../parts/pagination-select-field/pagination-select-field.component";
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-user-dashboard-sidebar',
  imports: [RouterLink, RouterModule, TranslateModule, LogoutBtnComponent, PaginationSelectFieldComponent],
  templateUrl: './user-dashboard-sidebar.component.html',
  styleUrl: './user-dashboard-sidebar.component.css'
})
export class UserDashboardSidebarComponent {
  getUsersService = inject(GetUsersService);
  readonly pagination = inject(PaginationStoreService);
  private triggerLoad = new Subject<void>();
  private readonly search = signal('');

  constructor() {
    this.triggerLoad.pipe(debounceTime(50)).subscribe(() => {
      this.getUsersService.loadUsers(
        untracked(() => this.search()),
      );
    });

    effect(() => {
      this.search();
      this.sortField();
      this.sortOrder();
      this.triggerLoad.next();
    });

    // Setzt totalItems im Store
    effect(() => {
      const count = this.getUsersService.users().length;
      this.pagination.setTotalItems(count);
    });

  }

  onRoleFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.getUsersService.roleFilter.set(value);
    this.getUsersService.loadUsers();
    this.pagination.reset();
  }

  // Suche und Sortierung
  handleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pagination.reset();
    this.getUsersService.roleFilter.set('');
    this.search.set(input.value);  // Signal updaten
  }

  readonly sortField = this.getUsersService.sortField;
  readonly sortOrder = this.getUsersService.sortOrder;

  changeSortField(event: Event): void {
    const field = (event.target as HTMLSelectElement).value;
    this.sortField.set(field as any);
    this.pagination.reset();
    this.getUsersService.roleFilter.set('');
  }

  toggleSortOrder(): void {
    const current = this.sortOrder();
    this.sortOrder.set(current === 'asc' ? 'desc' : 'asc');
    this.pagination.reset();
  }

}
