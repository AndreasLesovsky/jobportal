import { Component, inject } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  loginService = inject(LoginService);
  router = inject(Router);
  constructor() {
    const role = this.loginService.role();
    if (role === 'admin') this.router.navigate(['/dashboard/users']);
    if (role === 'hr') this.router.navigate(['/dashboard/applicants']);
    if (role === 'superadmin') this.router.navigate(['/dashboard/users']);
  }

}
