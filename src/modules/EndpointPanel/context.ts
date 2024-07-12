// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Effect, Layer, pipe } from 'effect';
import { createEntityStore, withSelected } from 'common/utils/entity';
import { createTypedMap, register } from 'common/utils/map';
import { createProviderContext, createRuntimeContext } from 'context';
import type { Endpoint } from './models/Endpoint';
import 'reflect-metadata/lite';

const PREFIX = '@EndpointPanel';

export class EndpointStore extends Context.Tag(`${PREFIX}/EndpointStore`)<
  EndpointStore,
  ReturnType<typeof createEndpointStore>
>() {}

export class Hello extends Context.Tag(`${PREFIX}/Hello`)<
  Hello,
  HelloService
>() {}

export class World extends Context.Tag(`${PREFIX}/World`)<
  World,
  WorldService
>() {}

export class ProviderMap extends Context.Tag(`${PREFIX}/ProviderMap`)<
  ProviderMap,
  ReturnType<typeof createProviderMap>
>() {}

export const create =
  <T extends { new (...args: any[]): InstanceType<T> }>(target: T) =>
  (args: ConstructorParameters<T>) =>
    new target(...args);

// TODO: distinguish between functions and classes. functions return an empty array, because their dependencies cannot be inferred from the type parameters. maybe something to consider for the future.
export const extractTags = <T extends { new (...args: any[]): any }>(
  target: T
) => resolveParams(target);

const resolveParams = <C extends { new (...args: any[]): any }>(target: C) =>
  Reflect.getMetadata('design:paramtypes', target) as ConstructorParameters<C>;

type InferTags<T> = {
  [K in keyof T]: T[K] extends Context.TagClassShape<infer Id, infer Shape>
    ? Context.TagClass<T[K], Id, Shape>
    : never;
};

const inferTags = <T extends any[]>(tags: [...T]) =>
  tags as InferTags<typeof tags>;

@Injectable()
class WorldService {
  // TODO: consider a better way to inject the dependencies, because directly using the tags as type parameters doesn't represent what is actually injected. This might require an inverse lookup, where we get the tag associated with the class. Not sure this is a good idea, but it is better than using typeof Hello, after which we have to infer the actual type of what is injected. The alternative would be to somehow infer the class type from the constructor parameters (if possible). This is is actually possible with factory functions, because we do it with typed map. Note that we cannot directly type the parameter as typeof Hello in this case, because this breaks reflect-metadata at runtime.
  constructor(private hello: EndpointStore) {
    console.log('WorldService', this.hello);
  }
}

@Injectable()
class HelloService {
  // TODO: think about how we want to return an effect from methods, to suspend the composed effects, allowing to merge over the event emitter queue and only start consuming when the layers are resolved and the map updated. This can create some noticable lag, if resolving the layers takes long, so this might need to be optional through arguments?

  store: Context.Tag.Service<EndpointStore>;
  world: Context.Tag.Service<World>;

  constructor(store: EndpointStore, world: World) {
    this.store = store as unknown as this['store'];
    this.world = world as unknown as this['world'];
  }

  showCount() {
    console.log('count', this.store.count.get());
  }
}

export const createEndpointStore = pipe(
  createEntityStore<Endpoint>,
  withSelected
);

const createProviderMap = pipe(
  createTypedMap,
  register(EndpointStore, createEndpointStore),
  register(World, WorldService),
  register(Hello, HelloService)
);

export function Injectable() {
  return (..._: any[]): any => {};
}

const layer = pipe(
  Layer.effect(
    Hello,
    pipe(
      ProviderMap,
      Effect.andThen((map) => {
        return pipe(
          // tODO: find out why inferTags infers differently when used inside another function, probably has to do with inference context.
          inferTags(extractTags(map.get(Hello))),
          Effect.all,
          // @ts-expect-error expecting tags, but getting deps
          Effect.andThen(create(map.get(Hello)))
        );
      })
    )
  ),
  Layer.provide(
    Layer.effect(
      World,
      pipe(
        ProviderMap,
        Effect.andThen((map) => {
          return pipe(
            inferTags(extractTags(map.get(World))),
            Effect.all,
            // @ts-expect-error expecting tags, but getting deps
            Effect.andThen((deps) => create(map.get(World))(deps))
          );
        })
      )
    )
  ),
  Layer.provideMerge(
    Layer.effect(
      EndpointStore,
      pipe(
        ProviderMap,
        Effect.andThen((map) => Effect.sync(map.get(EndpointStore)))
      )
    )
  ),
  Layer.provide(Layer.effect(ProviderMap, Effect.sync(createProviderMap)))
);

export const EndpointPanelRuntime = createRuntimeContext(layer);
export const EndpointPanelProvider = createProviderContext(createProviderMap);
