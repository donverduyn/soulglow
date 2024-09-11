import { Effect, PubSub, Queue } from 'effect';
import type { EventType } from 'common/utils/event';

export class MessageBusService {
  constructor(private readonly bus: PubSub.PubSub<EventType<unknown>>) {}

  publish = (message: EventType<unknown>) =>
    this.bus.pipe(PubSub.publish(message));

  register(fn: (message: EventType<unknown>) => void) {
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
