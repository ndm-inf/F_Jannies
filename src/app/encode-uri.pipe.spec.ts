import { EncodeURIPipe } from './encode-uri.pipe';

describe('EncodeURIPipe', () => {
  it('create an instance', () => {
    const pipe = new EncodeURIPipe();
    expect(pipe).toBeTruthy();
  });
});
