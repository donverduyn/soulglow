import { Effect, pipe } from 'effect';
import { RemoteType, DeviceControlService } from '__generated/api';
import { type LightbulbDto } from '../constants';

interface Crudable<T> {
  // create: (value: T) => Effect.Effect<T>;
  // delete: () => Effect.Effect<boolean>;
  // read: (id: string) => Effect.Effect<T>;
  update: (value: T) => Effect.Effect<T>;
}

export const createDeviceRepo = () => {
  const options = { deviceId: 5, groupId: 5, remoteType: RemoteType.FUT089 };
  const createOptions = (body: LightbulbDto) => ({
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
    create: (dto: LightbulbDto) => handlers.update(dto),
    delete: (dto: LightbulbDto) =>
      handle(() =>
        DeviceControlService.deleteGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions(dto)
        )
      ),
    read: (dto: LightbulbDto) =>
      handle(() =>
        DeviceControlService.getGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions(dto)
        )
      ),
    update: (dto: LightbulbDto) =>
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
