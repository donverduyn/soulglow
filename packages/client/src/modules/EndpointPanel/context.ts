// import { Effect, Layer, ManagedRuntime, pipe } from 'effect';
// import * as Tags from './tags';

// export function test() {
//   const layerParent = Layer.succeed(Tags.Foo, 'foo');
//   const runtimeParent = ManagedRuntime.make(layerParent);

//   // TODO: think about the consequence of having Foo in Foobar Service type, maybe this is actually what we want, because we do provide our dependencies on the service level, not only at construction level.

//   // TODO: try to use layer project etc, link the service of a tag
//   const test = Layer.service(Tags.Foo);
//   const test2 = Layer.project(Tags.Foo, Tags.Foobar, (a) =>
//     Effect.sync(() => a + 'bar')
//   );
//   const test44 = Layer.function(Tags.Foo, Tags.Foobar, (a) =>
//     Effect.sync(() => a + 'bar')
//   );
//   const test4 = Layer.passthrough(test);

//   const test3 = test2(test);

//   const layerChild = pipe(
//     Layer.succeed(
//       Tags.Foobar,
//       Effect.andThen(Tags.Foo, (s) => s + 'bar')
//     )
//   );
//   const runtimeChild = ManagedRuntime.make(layerChild);

//   const program = Effect.gen(function* () {
//     const effect = yield* Tags.Foobar;
//     return effect;
//   });

//   const fromChild = Effect.runSync(Effect.provide(program, runtimeChild));
//   const fromParent = Effect.provide(fromChild, runtimeParent);

//   const result = Effect.runSync(fromParent);
//   console.log(result); // prints foobar
//   return result;
// }
