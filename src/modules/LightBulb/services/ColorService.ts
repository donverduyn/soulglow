import type { Okhsv } from 'culori';
import { Effect, pipe, type Context } from 'effect';
import type { Device } from 'modules/App/models/device/Device';
import type { DeviceRepo } from '../context';

// this service should be responsible for updating the colors of lightbulbs,
// It delegates with one or multiple calls to the injected repositories
// Ultimately it supports

export class ColorServiceImpl {
  constructor(private deviceRepo: Context.Tag.Service<DeviceRepo>) {}

  updateColor(color: Partial<Device>) {
    return this.deviceRepo.update(color);
  }

  applyPattern(pattern: Okhsv[]) {
    // this is a placeholder for the actual implementation
    return pipe(Effect.sync(() => pattern));
  }
}
