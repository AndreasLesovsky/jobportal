import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDashboardSidebarComponent } from './job-dashboard-sidebar.component';

describe('JobDashboardSidebarComponent', () => {
  let component: JobDashboardSidebarComponent;
  let fixture: ComponentFixture<JobDashboardSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDashboardSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobDashboardSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
