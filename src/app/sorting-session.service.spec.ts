import { TestBed, inject } from '@angular/core/testing';

import { SortingSessionService } from './sorting-session.service';

describe('SortingSessionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SortingSessionService]
    });
  });

  it('should be created', inject([SortingSessionService], (service: SortingSessionService) => {
    expect(service).toBeTruthy();
  }));
});
