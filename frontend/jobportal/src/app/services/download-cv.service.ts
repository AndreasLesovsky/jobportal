import { Injectable } from '@angular/core';
import { apiUrl } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DownloadCvService {
  downloadCv(id: number): void {
    const downloadCvUrl = `${apiUrl}?endpoint=download_cv&id=${id}`;
    window.open(downloadCvUrl, '_blank');
  }
}
