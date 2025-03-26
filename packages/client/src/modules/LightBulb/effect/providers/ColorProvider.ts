import type { Okhsv } from 'culori/fn';
import { Effect, pipe, type Context } from 'effect';
import type { Device } from 'models/device/Device';
import * as Tags from '../../tags';

// this service should be responsible for updating the colors of lightbulbs,
// It delegates with one or multiple calls to the injected repositories
// Ultimately it supports

export class ColorServiceImpl {
  constructor(private deviceRepo: Context.Tag.Service<Tags.DeviceRepo>) {}

  updateColor(color: Partial<Device>) {
    return this.deviceRepo.update(color);
  }

  applyPattern(pattern: Okhsv[]) {
    // this is a placeholder for the actual implementation
    return pipe(Effect.sync(() => pattern));
  }
}
