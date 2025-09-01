import { Component, computed, effect, inject, signal } from '@angular/core';
import { PaginationComponent } from "../../parts/pagination/pagination.component";
import { GetUsersService } from '../../services/get-users.service';
import { PaginationStoreService } from '../../services/pagination-store.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { CommonModule } from '@angular/common';
import { DeleteEntityService } from '../../services/delete-entity.service';
import { RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-user-list',
  imports: [PaginationComponent, TranslateModule, CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  pagination = inject(PaginationStoreService);
  getUserService = inject(GetUsersService);
  languageService = inject(LanguageService);
  deleteService = inject(DeleteEntityService);
  loginService = inject(LoginService);
  readonly users = this.getUserService.users;
  readonly SUPERADMIN_USER_ID = 1;

  constructor() {
    effect(() => {
      this.pagination.setTotalItems(this.users().length);
    });
  }

  ngOnDestroy(): void {
    this.pagination.reset();
  }
  readonly paginatedUsers = computed(() => {
    const all = this.users();
    const page = this.pagination.currentPage();
    const perPage = this.pagination.itemsPerPage();
    const start = (page - 1) * perPage;
    return all.slice(start, start + perPage);
  });


}
