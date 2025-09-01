import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { JobDashboardJobListComponent } from "../../components/job-dashboard-job-list/job-dashboard-job-list.component";
import { JobDashboardSidebarComponent } from "../../components/job-dashboard-sidebar/job-dashboard-sidebar.component";

@Component({
  selector: 'app-dashboard-jobs',
  imports: [TranslateModule, JobDashboardJobListComponent, JobDashboardSidebarComponent],
  templateUrl: './dashboard-jobs.component.html',
  styleUrl: './dashboard-jobs.component.css'
})
export class DashboardJobsComponent {

}
