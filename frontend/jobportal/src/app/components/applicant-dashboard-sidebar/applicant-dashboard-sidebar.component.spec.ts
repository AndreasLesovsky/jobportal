import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicantDashboardSidebarComponent } from './applicant-dashboard-sidebar.component';

describe('ApplicantDashboardSidebarComponent', () => {
  let component: ApplicantDashboardSidebarComponent;
  let fixture: ComponentFixture<ApplicantDashboardSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicantDashboardSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicantDashboardSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
