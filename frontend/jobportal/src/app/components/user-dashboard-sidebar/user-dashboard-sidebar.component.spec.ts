import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDashboardSidebarComponent } from './user-dashboard-sidebar.component';

describe('UserDashboardSidebarComponent', () => {
  let component: UserDashboardSidebarComponent;
  let fixture: ComponentFixture<UserDashboardSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDashboardSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
