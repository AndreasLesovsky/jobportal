import { Component } from '@angular/core';
import { UserDashboardSidebarComponent } from "../../components/user-dashboard-sidebar/user-dashboard-sidebar.component";
import { UserListComponent } from "../../components/user-list/user-list.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-user',
  imports: [UserDashboardSidebarComponent, UserListComponent, TranslateModule],
  templateUrl: './dashboard-user.component.html',
  styleUrl: './dashboard-user.component.css'
})
export class DashboardUserComponent {

}
