import { Effect, PubSub, Queue } from 'effect';
import type { createEvent } from 'common/utils/event';

export class MessageBusService {
  constructor(
    private readonly bus: PubSub.PubSub<
      ReturnType<ReturnType<typeof createEvent>>
    >
  ) {}

  publish = (message: ReturnType<ReturnType<typeof createEvent>>) =>
    this.bus.pipe(PubSub.publish(message));

  register(fn: (message: ReturnType<ReturnType<typeof createEvent>>) => void) {
    return this.bus.pipe(
      PubSub.subscribe,
      Effect.andThen((sub) =>
        sub.pipe(Queue.take, Effect.tap(fn), Effect.forever)
      ),
      Effect.scoped
    );
  }

  // TODO: think about using addFinalizer to shutdown the bus, or at least investigate the consequences of not doing so. If references to the bus are kept, it will not be garbage collected.
}
