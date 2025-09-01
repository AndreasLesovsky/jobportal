import { Component } from '@angular/core';
import { JobListComponent } from "../../components/job-list/job-list.component";
import { TranslateModule } from '@ngx-translate/core';
import { JobBenefitsComponent } from "../../components/job-benefits/job-benefits.component";

@Component({
  selector: 'app-jobs',
  imports: [JobListComponent, TranslateModule, JobBenefitsComponent],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent {

}
