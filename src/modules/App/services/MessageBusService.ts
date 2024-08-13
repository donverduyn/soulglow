import { Effect, PubSub, Queue } from 'effect';
import type { Message } from 'modules/App/models/message';

export class MessageBusImpl {
  constructor(private readonly bus: PubSub.PubSub<Message>) {}

  publish = (message: Message) => this.bus.pipe(PubSub.publish(message));
  register(fn: <T>(message: Message<T>) => void) {
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
