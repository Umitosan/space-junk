import { TestBed, inject } from '@angular/core/testing';

import { SatelliteService } from './satellite.service';

describe('SatelliteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SatelliteService]
    });
  });

  it('should be created', inject([SatelliteService], (service: SatelliteService) => {
    expect(service).toBeTruthy();
  }));
});
