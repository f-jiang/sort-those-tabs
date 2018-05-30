import { TestBed, inject } from '@angular/core/testing';

import { TabFocuserService } from './tab-focuser.service';

describe('TabFocuserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TabFocuserService]
    });
  });

  it('should be created', inject([TabFocuserService], (service: TabFocuserService) => {
    expect(service).toBeTruthy();
  }));
});
