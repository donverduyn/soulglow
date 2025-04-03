import { Ref } from 'effect';
import type { InitializerState, Nullable } from 'modules/EndpointPanel/tags';

export class InitializerService<
  T = InitializerState | Nullable<InitializerState>,
> {
  constructor(private readonly ref: Ref.Ref<T>) {}

  setup(config: Partial<T>) {
    return this.ref.pipe(
      Ref.update((existing) =>
        Object.assign({}, existing, config, { initialized: true })
      )
    );
  }
}
