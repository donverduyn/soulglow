import { Effect, Layer, pipe } from 'effect';
import {
  type GroupState,
  type GroupStateCommands,
  RemoteType,
  DeviceControlService,
} from '__generated/api';
import { DeviceRepo } from '../constants';

interface Crudable<T> {
  // create: (value: T) => Effect.Effect<T>;
  // delete: () => Effect.Effect<boolean>;
  // read: (id: string) => Effect.Effect<T>;
  update: (value: T) => Effect.Effect<T>;
}

export const createDeviceRepo = <
  TBody extends GroupState & GroupStateCommands,
>() => {
  const options = { deviceId: 5, groupId: 5, remoteType: RemoteType.FUT089 };
  const createOptions = (body: TBody) => ({
    body,
    path: {
      'device-id': options.deviceId,
      'group-id': options.groupId,
      'remote-type': options.remoteType,
    },
    query: { blockOnQueue: true },
  });

  const handle = <T>(
    call: () => Promise<{
      data?: T;
      error?: unknown;
    }>
  ) =>
    pipe(
      Effect.tryPromise(call),
      Effect.andThen(({ error, data }) =>
        error ? Effect.fail(new FetchError()) : Effect.succeed(data)
      ),
      Effect.catchAllDefect(() => Effect.fail(new FetchError())),
      Effect.catchAll(() => Effect.fail(new FetchError()))
    );

  const handlers = {
    create: (dto: TBody) => handlers.update(dto),
    delete: (dto: TBody) =>
      handle(() =>
        DeviceControlService.deleteGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions(dto)
        )
      ),
    read: (dto: TBody) =>
      handle(() =>
        DeviceControlService.getGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions(dto)
        )
      ),
    update: (dto: TBody) =>
      handle(() =>
        DeviceControlService.putGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions(dto)
        )
      ),
  };

  return handlers;
};

class FetchError {
  readonly _tag = 'FetchError';
}

export const deviceRepoLayer = pipe(
  Layer.effect(DeviceRepo, Effect.sync(createDeviceRepo))
);
