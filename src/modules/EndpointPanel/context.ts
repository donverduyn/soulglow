// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Effect, Layer, pipe, Runtime } from 'effect';
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
  constructor(private hello: EndpointStore) {
    console.log('WorldService', this.hello);
  }
}

@Injectable()
class HelloService {
  // TODO: think about how we want to return an effect from methods, to suspend the composed effects, allowing to merge over the event emitter queue and only start consuming when the layers are resolved and the map updated. This can create some noticable lag, if resolving the layers takes long, so this might need to be optional through arguments?

  store: Context.Tag.Service<EndpointStore>;
  world: Context.Tag.Service<World>;

  // TODO: this totally sucks, because we have to cast the store and world to the actual service type, because the constructor doesn't know the actual type of the injected service. This is because we use the tag as a type parameter, but the actual type is the service. We might want to consider a different approach, by obtaining the tags from a different place. This might also allow us to use factory functions instead.
  constructor(store: EndpointStore, world: World) {
    this.store = store as unknown as this['store'];
    this.world = world as unknown as this['world'];
  }

  sayHello() {
    console.log('Hello');
  }
  showCount() {
    return this.store.count.get();
  }
}

export const createEndpointStore = pipe(
  createEntityStore<Endpoint>,
  withSelected
);

const createEndpointStore2 = (hello: HelloService) => {
  hello.sayHello();
  return createEndpointStore();
};

const context = Context.empty().pipe(
  Context.add(EndpointStore, createEndpointStore())
);

const ctx1 = context.pipe(Context.get(EndpointStore));
console.log({ ctx1 });

const createProviderMap = pipe(
  createTypedMap,
  register(EndpointStore, createEndpointStore),
  register(World, WorldService),
  register(Hello, HelloService)
);

export function Injectable() {
  return (..._: any[]): any => {};
}

// TODO: maybe, we can have a factory function, where we can access the parameters, yet infer the services through map.get, such that the resulting function is correctly typed. This would still require the ability to get the tags from the parameter types. If this is not possible, we could consider using either an object, or maybe a higher order function that first returns the tags and then a factory function that is provided the tags where the parameters are inferred correctly from the tags. This would require a tuple of exact types to be passed to the factory function, but it should be possible.

// type InferShapes<T> = {
//   [K in keyof T]: T[K] extends Context.TagClass<any, any, infer Shape>
//     ? Shape
//     : never;
// };
// const createFactory =
//   <D extends any[]>(deps: [...D]) =>
//   <R>(fac: (arg: InferShapes<typeof deps>) => R) =>
//     fac(deps);

type InferShapes<T> = {
  [K in keyof T]: T[K] extends Context.TagClass<any, any, infer Shape>
    ? Shape
    : never;
};

type ToInstanceType<T> = {
  [K in keyof T]: T[K] extends new (...args: infer _) => infer R ? R : T[K];
};

const createFactory =
  // <M extends TypedMap<any, any>>(map: M) =>


    <D extends Array<Context.TagClass<any, any, any>>>(
      // TODO: find a way to keep the tuple, as intersecting IncludedIn makes it a union
      ...deps: /*IncludedIn<
      ReturnType<(typeof map)['keys']>,
      ToInstanceType<D>
    > extends true
      ? */ [...D]
      /*  : never 8 */
    ) =>
    <R>(fac: (...arg: [...D]) => R) =>
      pipe(
        deps,
        Effect.all
        // Effect.tap((deps) => {
        //   console.log({ deps });
        // }),
      );

const testtest = createFactory(
  EndpointStore,
  World
)((...args) => createEndpointStore());
// Effect.runSync(testtest)

const layer = pipe(
  Layer.effect(
    Hello,
    pipe(
      ProviderMap,
      Effect.andThen((map) => {
        return pipe(
          inferTags(extractTags(map.get(Hello))),
          Effect.all,
          // @ts-expect-error expecting tags, but getting deps
          Effect.andThen(create(map.get(Hello)))
        );
      })
    )
  ),
  Layer.provideMerge(
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

const helloService = Effect.runSync(
  pipe(
    Layer.toRuntime(layer),
    Effect.scoped,
    Effect.andThen(Runtime.runSync),
    Effect.andThen((runSync) => runSync(Hello))
  )
);

console.log({ helloService });

export const EndpointPanelRuntime = createRuntimeContext(layer);
export const EndpointPanelProvider = createProviderContext(createProviderMap);
