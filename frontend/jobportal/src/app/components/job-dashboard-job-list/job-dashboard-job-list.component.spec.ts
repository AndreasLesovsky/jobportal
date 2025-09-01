import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobDashboardJobListComponent } from './job-dashboard-job-list.component';

describe('JobDashboardJobListComponent', () => {
  let component: JobDashboardJobListComponent;
  let fixture: ComponentFixture<JobDashboardJobListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDashboardJobListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobDashboardJobListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
