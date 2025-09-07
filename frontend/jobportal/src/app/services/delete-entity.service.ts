import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GetUsersService } from './get-users.service';
import { GetApplicantsService } from './get-applicants.service';
import { GetJobsService } from './get-jobs.service';
import { apiUrl } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class DeleteEntityService {
  private http = inject(HttpClient);
  getUserService = inject(GetUsersService);
  getApplicantsService = inject(GetApplicantsService);
  getJobsService = inject(GetJobsService);
  errorType = signal<'existingApplicantForJobId' | 'deleteLoggedInUser' | null>(null);
  selectedTable = signal<'tbl_users' | 'tbl_applicants' | 'tbl_jobs' | null>(null);
  selectedEntityId = signal<number | null>(null);
  private readonly deleteEntityUrl = apiUrl;
  isDeleteButtonDisabled = signal(false);

  openDeleteModal(table: 'tbl_users' | 'tbl_applicants' | 'tbl_jobs', id: number) {
    this.selectedTable.set(table);
    this.selectedEntityId.set(id);
    this.isDeleteButtonDisabled.set(false);

    const modalEl = document.getElementById('confirmDeleteModal');
    if (modalEl) {
      const modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);

      // Fehler zurücksetzen, wenn das Modal geschlossen wird
      modalEl.addEventListener('hidden.bs.modal', () => {
        this.errorType.set(null);
      }, { once: true });

      modalInstance.show();
    }
  }

  async confirmDelete(): Promise<void> {
    const table = this.selectedTable();
    const id = this.selectedEntityId();

    if (!table || !id) {
      console.warn('DeleteEntityService: Ungültige Löschdaten');
      return;
    }

    const body = new URLSearchParams();
    body.set('endpoint', 'delete_entity');
    body.set('table', table);
    body.set('id', id.toString());

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    // Reset vorheriger Fehler
    this.errorType.set(null);

    try {
      await firstValueFrom(
        this.http.post<void>(this.deleteEntityUrl, body.toString(), {
          headers,
          withCredentials: true,
        })
      );

      // Daten neu laden je nach Tabelle
      if (table === 'tbl_applicants') {
        this.getApplicantsService.loadApplicants();
      } else if (table === 'tbl_jobs') {
        this.getJobsService.loadJobs();
      } else if (table === 'tbl_users') {
        this.getUserService.loadUsers();
      }

      // Modal schließen
      const modalEl = document.getElementById('confirmDeleteModal');
      if (modalEl) {
        const modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.hide();
      }

      // Reset
      this.selectedTable.set(null);
      this.selectedEntityId.set(null);
    } catch (err) {
      this.isDeleteButtonDisabled.set(true);
      if (err instanceof HttpErrorResponse && (err.status === 400 || err.status === 403)) {
        this.errorType.set(err.error?.errorType ?? null);
      } else {
        this.errorType.set(null);
        console.error('Löschen fehlgeschlagen:', err);
      }
    }
  }
}