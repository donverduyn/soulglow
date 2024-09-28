import { Context, type Queue } from 'effect';
// TODO: do not import models from different modules
import type { Device } from 'modules/App/models/device/Device';
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
