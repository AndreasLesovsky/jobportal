import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardApplicantsComponent } from './dashboard-applicants.component';

describe('DashboardApplicantsComponent', () => {
  let component: DashboardApplicantsComponent;
  let fixture: ComponentFixture<DashboardApplicantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardApplicantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardApplicantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
