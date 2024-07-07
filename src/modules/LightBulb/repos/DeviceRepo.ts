import { Effect, flow } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { RemoteType, DeviceControlService } from '__generated/api';
import { FetchError, type LightbulbDto } from '../context';

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

  const handle = flow(
    <T>(
      effect: Effect.Effect<{ data?: T; error?: unknown }, UnknownException>
    ) => effect,
    Effect.andThen(({ error, data }) =>
      error ? Effect.fail(new FetchError()) : Effect.succeed(data)
    ),
    Effect.catchAllDefect(() => Effect.fail(new FetchError())),
    Effect.catchAll(() => Effect.fail(new FetchError()))
  );

  const handlers = {
    create: (dto: LightbulbDto) => handlers.update(dto),
    delete: flow(() => {
      return Effect.tryPromise(() =>
        DeviceControlService.deleteGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions()
        )
      );
    }, handle),
    read: flow(() => {
      return Effect.tryPromise(() =>
        DeviceControlService.getGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions()
        )
      );
    }, handle),
    update: flow((dto: LightbulbDto) => {
      return Effect.tryPromise(() =>
        DeviceControlService.putGatewaysByDeviceIdByRemoteTypeByGroupId(
          createOptions(dto)
        )
      );
    }, handle),
  };

  return handlers;
};
