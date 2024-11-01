import { Effect, flow } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { RemoteType, DeviceControlService } from '__generated/api';
import { FetchError } from 'common/utils/effect';
import { Device } from 'models/device/model';

export class DeviceRepoImpl {
  options = { deviceId: 5, groupId: 5, remoteType: RemoteType.FUT089 };
  createOptions = (body?: Device) => ({
    ...(body && { body }),
    headers: {
      // TODO: this should be injected from the global runtime
      endpoint: 'http://192.168.0.153',
    },
    path: {
      'device-id': this.options.deviceId,
      'group-id': this.options.groupId,
      'remote-type': this.options.remoteType,
    },
    query: { blockOnQueue: true },
  });

  handle = flow(
    <T>(
      effect: Effect.Effect<{ data?: T; error?: unknown }, UnknownException>
    ) => effect,
    Effect.andThen(({ error, data }) =>
      error ? Effect.fail(new FetchError()) : Effect.succeed(data)
    ),
    Effect.catchAllDefect(() => Effect.fail(new FetchError())),
    Effect.catchAll(() => Effect.fail(new FetchError()))
  );

  create = (dto: Device) => this.update(dto);
  delete = flow(() => {
    return Effect.tryPromise(() =>
      DeviceControlService.deleteGatewaysByDeviceIdByRemoteTypeByGroupId(
        this.createOptions()
      )
    );
  }, this.handle);
  read = flow(() => {
    return Effect.tryPromise(() =>
      DeviceControlService.getGatewaysByDeviceIdByRemoteTypeByGroupId(
        this.createOptions()
      )
    );
  }, this.handle);
  update = flow((dto: Device) => {
    return Effect.tryPromise(() =>
      DeviceControlService.putGatewaysByDeviceIdByRemoteTypeByGroupId(
        this.createOptions(dto)
      )
    );
  }, this.handle);
}
