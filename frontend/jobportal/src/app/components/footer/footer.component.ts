import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  languageService = inject(LanguageService);
  readonly currentYear = new Date().getFullYear();
}