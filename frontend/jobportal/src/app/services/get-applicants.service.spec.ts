import { TestBed } from '@angular/core/testing';

import { GetApplicantsService } from './get-applicants.service';

describe('GetApplicantsService', () => {
  let service: GetApplicantsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetApplicantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
