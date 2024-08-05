import type { Okhsv } from 'culori';
import { Effect, pipe } from 'effect';

// this service should be responsible for updating the colors of lightbulbs,
// It delegates with one or multiple calls to the injected repositories
// Ultimately it supports
export class ColorServiceImpl {
  updateColor(color: { hue: number; level: number; saturation: number }) {
    // this is a placeholder for the actual implementation
    return pipe(Effect.sync(() => color));
  }

  applyPattern(pattern: Okhsv[]) {
    // this is a placeholder for the actual implementation
    return pipe(Effect.sync(() => pattern));
  }
}
