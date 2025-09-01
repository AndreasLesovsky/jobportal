import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEntityModalComponent } from './delete-entity-modal.component';

describe('DeleteEntityModalComponent', () => {
  let component: DeleteEntityModalComponent;
  let fixture: ComponentFixture<DeleteEntityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteEntityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteEntityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
