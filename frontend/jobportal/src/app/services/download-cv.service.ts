import { Injectable } from '@angular/core';
import { apiUrls } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DownloadCvService {
  downloadCv(id: number): void {
    const downloadCvUrl = `${apiUrls.downloadCv}?id=${id}`;
    window.open(downloadCvUrl, '_blank');
  }
}
