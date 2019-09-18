import { TestBed } from '@angular/core/testing';

import { BlockChanHostSettingsService } from './block-chan-host-settings.service';

describe('BlockChanHostSettingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BlockChanHostSettingsService = TestBed.get(BlockChanHostSettingsService);
    expect(service).toBeTruthy();
  });
});
