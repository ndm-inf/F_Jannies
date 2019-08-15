import { TestBed } from '@angular/core/testing';

import { ETHTipService } from './ethtip.service';

describe('ETHTipService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ETHTipService = TestBed.get(ETHTipService);
    expect(service).toBeTruthy();
  });
});
