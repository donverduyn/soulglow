import { Effect, pipe } from 'effect';
import { RemoteType, DeviceControlService } from '__generated/api';
import { FetchError, type LightbulbDto } from '../constants';

export const createDeviceRepo = () => {
  const options = { deviceId: 5, groupId: 5, remoteType: RemoteType.FUT089 };
  const createOptions = (body?: LightbulbDto) => ({
    ...(body && { body }),
    headers: {
      // TODO: this should be injected from the global runtime
      endpoint: 'http://192.168.0.153',
    },
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
      // Effect.gen(function* () {
      //   yield* Effect.logDebug('Fetching data');
      // }),
      // if we can inject from the global runtime, we can access the url
      Effect.tryPromise(() => call()),
      Effect.andThen(({ error, data }) =>
        error ? Effect.fail(new FetchError()) : Effect.succeed(data)
      ),
      Effect.catchAllDefect(() => Effect.fail(new FetchError())),
      Effect.catchAll(() => Effect.fail(new FetchError()))
    );

  const handlers = {
    create: (dto: LightbulbDto) => handlers.update(dto),
    delete: () =>
      handle(() =>
        DeviceControlService.deleteGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions()
        )
      ),
    read: () =>
      handle(() =>
        DeviceControlService.getGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions()
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
