import { TestBed } from '@angular/core/testing';

import { DeleteEntityService } from './delete-entity.service';

describe('DeleteEntityService', () => {
  let service: DeleteEntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteEntityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
