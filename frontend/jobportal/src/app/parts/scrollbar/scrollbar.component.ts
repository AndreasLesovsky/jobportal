import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-scrollbar',
  imports: [],
  templateUrl: './scrollbar.component.html',
  styleUrl: './scrollbar.component.css'
})
export class ScrollbarComponent implements OnInit {
  ngOnInit(): void {
    window.addEventListener('scroll', this.updateScrollProgress);
  }

  private updateScrollProgress(): void {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;
    const scrollPercentage = (scrollPosition / scrollHeight) * 100;

    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
      progressBar.style.height = `${scrollPercentage}%`;
    }
  }
}
