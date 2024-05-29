import * as React from 'react';
import {
  Queue,
  Effect,
  pipe,
  Context,
  Scope,
  Layer,
  Runtime,
  Exit,
} from 'effect';

// const initializeRoute2 = (app: string) =>
//   Effect.gen(function* () {
//     const runtime = yield* Effect.runtime();
//     const runFork = Runtime.runFork(runtime);

//     const fiber = runFork(
//       Effect.scoped(
//         Effect.gen(function* () {
//           yield* Effect.sleep(1000);
//           yield* Console.log(app);
//           yield* Effect.addFinalizer(() => Console.log('hello'));
//         })
//       )
//     );
//   });

// Effect.runFork(initializeRoute2('foobar'));

const createRuntime = async <T>(layer: Layer.Layer<T>) => {
  const scope = Effect.runSync(Scope.make());
  const runtime = await Effect.runPromise(
    pipe(layer, Layer.toRuntime, Scope.extend(scope))
  );

  const runPromise = Runtime.runPromise(runtime);
  const dispose = () => Effect.runFork(Scope.close(scope, Exit.void));
  return { dispose, runPromise };
};

type Options = {
  capacity: number;
  delay: number;
  type: 'sliding' | 'dropping' | 'bounded';
};

const defaults: Options = {
  capacity: 10,
  delay: 100,
  type: 'sliding',
};

export const Throttler = <T>() =>
  class Throttler extends Context.Tag('Throttler')<
    Throttler,
    Queue.Queue<T>
  >() {};

const take = <T>(delay: number) =>
  pipe(
    Effect.gen(function* () {
      const queue = yield* Throttler<T>();
      const item = yield* Queue.take(queue);
      console.log(item);
      yield* Effect.sleep(delay);
    })
  );

const layer = <T>(options: Options) =>
  pipe(
    Layer.scopedDiscard(
      pipe(take<T>(options.delay), Effect.forever, Effect.forkScoped)
    ),
    Layer.provideMerge(
      Layer.scoped(
        Throttler<T>(),
        pipe(Queue[options.type]<T>(options.capacity))
      )
    )
  );

export const useEffectQueue = <T>(options: Partial<Options> = defaults) => {
  const config = Object.assign(defaults, options);
  const runtime = React.useMemo(() => createRuntime(layer<T>(config)), []);
  const runtimeRef = React.useRef<Awaited<typeof runtime> | null>(null);

  React.useEffect(() => {
    void runtime.then((runtime) => {
      runtimeRef.current = runtime;
    });
    return () => {
      void runtimeRef.current?.dispose();
    };
  }, []);

  const enqueue = React.useCallback((value: T) => {
    void runtimeRef.current?.runPromise(
      Effect.gen(function* () {
        const queue = yield* Throttler<T>();
        yield* queue.offer(value);
      })
    );
  }, []);

  return enqueue;
};
