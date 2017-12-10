import { TestBed, inject } from '@angular/core/testing';

import { WindowsService } from './windows.service';

describe('WindowsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowsService]
    });
  });

  it('should be created', inject([WindowsService], (service: WindowsService) => {
    expect(service).toBeTruthy();
  }));
});
