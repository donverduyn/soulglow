import { Effect, pipe, type Context, String } from 'effect';
import type { EndpointStore, World } from '../context';

export class HelloService {
  constructor(
    private store: Context.Tag.Service<EndpointStore>,
    private world: Context.Tag.Service<World>
  ) {}

  sayHello = pipe(
    this.world.getText,
    Effect.andThen((world) => String.concat('Hello ', world))
  );

  showCount = Effect.sync(() => this.store.count.get());
}
