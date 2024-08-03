import { Effect, pipe, PubSub, Queue } from 'effect';
import type { Message } from 'modules/App/models/message';

// TODO: find out why fast refresh breaks effect from this file. Likely because it is used to create the layer which causes AppRuntime to be recreated. There are also a few places that referentially compare the layer in useEffect, which might be in the direction of the issue.

export class MessageBusService {
  constructor(private readonly bus: PubSub.PubSub<Message>) {}

  publish = (message: Message) => pipe(this.bus, PubSub.publish(message));
  register(callback: <T>(message: Message<T>) => void) {
    return pipe(
      this.bus,
      PubSub.subscribe,
      Effect.andThen((sub) =>
        pipe(sub, Queue.take, Effect.tap(callback), Effect.forever)
      ),
      Effect.scoped
    );
  }
}
