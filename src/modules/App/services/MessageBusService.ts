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
}
