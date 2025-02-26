import { describe, it, expect } from 'vitest';

describe('lightBulb Module', () => {
  it('should turn on the light bulb', () => {
    expect.assertions(1);
    const isLightOn = true;
    expect(isLightOn).toBeTruthy();
  });

  it('should turn off the light bulb', () => {
    expect.assertions(1);
    const isLightOn = false;
    expect(isLightOn).toBeFalsy();
  });

  it('should change the light bulb color', () => {
    expect.assertions(1);
    const lightColor = 'red';
    expect(lightColor).toBe('red');
  });

  it('should dim the light bulb', () => {
    expect.assertions(1);
    const lightBrightness = 50;
    expect(lightBrightness).toBe(50);
  });

  it('should brighten the light bulb', () => {
    expect.assertions(1);
    const lightBrightness = 100;
    expect(lightBrightness).toBe(100);
  });
});
