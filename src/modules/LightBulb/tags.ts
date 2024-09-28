import { Context, type Queue } from 'effect';
import type { Device } from 'models/device';
import type { DeviceRepoImpl } from './repos/DeviceRepo';
import type { ColorServiceImpl } from './services/ColorService';

class ApiThrottler extends Context.Tag('@Lightbulb/Throttler')<
  ApiThrottler,
  Queue.Queue<Device>
>() {}

class DeviceRepo extends Context.Tag('@Lightbulb/DeviceRepo')<
  DeviceRepo,
  DeviceRepoImpl
>() {}

class ColorService extends Context.Tag('@Lightbulb/ColorService')<
  ColorService,
  ColorServiceImpl
>() {}

export { ApiThrottler, DeviceRepo, ColorService };
