import { SecondsToMmSsPipe } from './seconds-to-mm-ss.pipe';

describe('SecondsToMmSsPipe', () => {
  const pipe = new SecondsToMmSsPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms value correctly', () => {
    // Beispiel: pipe.transform(input) → erwartet output
    const input = 1440;
    const output = '24:00'; 
    expect(pipe.transform(input)).toBe(output);
  });
});
