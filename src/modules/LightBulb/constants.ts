import { Context, type Queue } from 'effect';
import { observable } from 'mobx';
import { v4 as uuid } from 'uuid';
import type { GroupState, GroupStateCommands } from '__generated/api';
import type { createDeviceRepo } from './repos/DeviceRepo';

export type LightbulbDto = GroupState & GroupStateCommands;

export enum LightMode {
  COLOR = 'color',
  NIGHT = 'night',
  SCENE = 'scene',
  WHITE = 'white',
}

export const MODE_ITEMS = observable.array([
  { id: uuid(), label: 'Color', value: LightMode.COLOR },
  { id: uuid(), label: 'White', value: LightMode.WHITE },
]);

export const Throttler = <T>() =>
  class Throttler extends Context.Tag('@Lightbulb/Throttler')<
    Throttler,
    Queue.Queue<T>
  >() {};

export class DeviceRepo extends Context.Tag('@Lightbulb/DeviceRepo')<
  DeviceRepo,
  ReturnType<typeof createDeviceRepo>
>() {}
