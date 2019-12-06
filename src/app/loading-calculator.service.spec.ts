import { TestBed } from '@angular/core/testing';

import { LoadingCalculatorService } from './loading-calculator.service';

describe('LoadingCalculatorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadingCalculatorService = TestBed.get(LoadingCalculatorService);
    expect(service).toBeTruthy();
  });
});
