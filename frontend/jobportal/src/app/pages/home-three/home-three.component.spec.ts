import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeThreeComponent } from './home-three.component';

describe('HomeThreeComponent', () => {
  let component: HomeThreeComponent;
  let fixture: ComponentFixture<HomeThreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeThreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
