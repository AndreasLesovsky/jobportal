import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardJobsComponent } from './dashboard-jobs.component';

describe('DashboardJobsComponent', () => {
  let component: DashboardJobsComponent;
  let fixture: ComponentFixture<DashboardJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardJobsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
