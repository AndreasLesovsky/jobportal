import { AfterViewInit, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import feather from 'feather-icons';
import { LanguageService } from '../../services/language.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements AfterViewInit {
  languageService = inject(LanguageService);
  readonly currentYear = new Date().getFullYear();
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      feather.replace();
    }, 100);
  }
}