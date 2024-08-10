import { Effect, pipe, PubSub, Queue } from 'effect';
import type { Message } from 'modules/App/models/message';

export class MessageBusImpl {
  constructor(private readonly bus: PubSub.PubSub<Message>) {}

  publish = (message: Message) => pipe(this.bus, PubSub.publish(message));
  register(callback: <T>(message: Message<T>) => void) {
    return pipe(
      this.bus,
      PubSub.subscribe,
      Effect.andThen((sub) => {
        return pipe(sub, Queue.take, Effect.tap(callback), Effect.forever);
      }),
      Effect.scoped
    );
  }

  // TODO: think about using addFinalizer to shutdown the bus, or at least investigate the consequences of not doing so. If references to the bus are kept, it will not be garbage collected.
}
