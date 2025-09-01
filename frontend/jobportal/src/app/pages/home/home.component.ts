import { Component, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { DarkmodeService } from '../../services/darkmode.service';
import { NgOptimizedImage } from '@angular/common';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

@Component({
  selector: 'app-home',
  imports: [TranslateModule, NgOptimizedImage, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  darkModeService = inject(DarkmodeService);

  scrollTo(element: HTMLElement, duration = 1.75): void {
    const headerOffset = 5 * parseFloat(getComputedStyle(document.documentElement).fontSize); // 5rem

    gsap.to(window, {
      duration,
      scrollTo: { y: element, offsetY: headerOffset },
      ease: 'sine.inOut',
    });
  }

  
}