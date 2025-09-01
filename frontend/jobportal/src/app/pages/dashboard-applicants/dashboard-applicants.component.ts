import { Component } from '@angular/core';
import { ApplicantDashboardSidebarComponent } from "../../components/applicant-dashboard-sidebar/applicant-dashboard-sidebar.component";
import { ApplicantListComponent } from "../../components/applicant-list/applicant-list.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-applicants',
  imports: [ApplicantDashboardSidebarComponent, ApplicantListComponent, TranslateModule],
  templateUrl: './dashboard-applicants.component.html',
  styleUrl: './dashboard-applicants.component.css'
})
export class DashboardApplicantsComponent {

}
