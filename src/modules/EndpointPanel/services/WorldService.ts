import { Effect } from 'effect';

export class WorldService {
  getText = Effect.sync(() => 'World!');
}
