import { Effect, flow } from 'effect';
import type { UnknownException } from 'effect/Cause';
import { RemoteType, DeviceControlService } from '__generated/api';
import { FetchError } from 'common/utils/effect';
import { Device } from 'models/device/model';

export class DeviceRepoImpl {
  options = { deviceId: 5, groupId: 5, remoteType: RemoteType.FUT089 };
  headers = {
    // TODO: this should be injected from the global runtime
    endpoint: 'http://192.168.0.153',
  };
  path = {
    'device-id': this.options.deviceId,
    'group-id': this.options.groupId,
    'remote-type': this.options.remoteType,
  };

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
      DeviceControlService.deleteGatewaysByDeviceIdByRemoteTypeByGroupId({
        headers: this.headers,
        path: this.path,
      })
    );
  }, this.handle);
  read = flow(() => {
    return Effect.tryPromise(() =>
      DeviceControlService.getGatewaysByDeviceIdByRemoteTypeByGroupId({
        headers: this.headers,
        path: this.path,
      })
    );
  }, this.handle);
  update = flow((dto: Device) => {
    return Effect.tryPromise(() =>
      DeviceControlService.putGatewaysByDeviceIdByRemoteTypeByGroupId({
        body: dto,
        headers: this.headers,
        path: this.path,
      })
    );
  }, this.handle);
}
