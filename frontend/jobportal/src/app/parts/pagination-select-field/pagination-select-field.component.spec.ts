import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationSelectFieldComponent } from './pagination-select-field.component';

describe('PaginationSelectFieldComponent', () => {
  let component: PaginationSelectFieldComponent;
  let fixture: ComponentFixture<PaginationSelectFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationSelectFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationSelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
