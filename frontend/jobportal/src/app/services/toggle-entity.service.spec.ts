import { TestBed } from '@angular/core/testing';

import { ToggleEntityService } from './toggle-entity.service';

describe('ToggleEntityService', () => {
  let service: ToggleEntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleEntityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
