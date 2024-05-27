import * as React from 'react';
import {
  Queue,
  Effect,
  pipe,
  Fiber,
  Cache,
  Duration,
  Context,
  Logger,
  Scope,
  Layer,
  Runtime,
  Exit,
} from 'effect';

// pipe(
//   Effect.tryPromise(() => new Promise((resolve) => setTimeout(resolve, 1000))),
//   Effect.andThen(() =>
//     Effect.acquireRelease(
//       Effect.sync(() => 'foo'),
//       (server) => Console.log('close')
//     )
//   ),
//   // Effect.runtime,
//   Effect.andThen(Effect.runtime),
//   Effect.andThen((r) => Effect.succeed(r))
// );

// Define the main route, IndexRouteLive, as a Layer
// const IndexRouteLive = Layer.effectDiscard(
//   Effect.gen(function* () {
//     const app = yield* Express
//     const runFork = Runtime.runFork(yield* Effect.runtime())
//     app.get("/", (_, res) => {
//       runFork(Effect.sync(() => res.send("Hello World!")))
//     })
//   })
// )

// const LoggerLive = Logger.replaceScoped(
//   Logger.defaultLogger,
//   Logger.logfmtLogger.pipe(
//     Logger.batched('500 millis', (messages) =>
//       Console.log('BATCH', messages.join('\n'))
//     )
//   )
// );

// Effect.gen(function* () {
//   yield* Effect.log('one');
//   yield* Effect.log('two');
//   yield* Effect.log('three');
// }).pipe(Effect.provide(LoggerLive), Effect.runFork);

// const initializeRoute = (app: string) =>
//   pipe(
//     Effect.runtime(),
//     Effect.andThen(Runtime.runFork),
//     Effect.andThen((runFork) => {
//       // eslint-disable-next-line prettier/prettier
//       runFork(pipe(
//         Effect.sleep(1000),
//         Effect.andThen(Console.log(app))
//       ));
//     })
//   );

// Define a configuration layer
// const appLayer = Logger.replace(
//   Logger.defaultLogger,
//   Logger.make(({ message }) => console.log(message))
// );

class Throttler extends Context.Tag('Queue')<
  Throttler,
  Queue.Queue<string>
>() {}

const throttlerLayer = Layer.effect(
  Throttler,
  Effect.gen(function* () {
    const queue = yield* Queue.sliding<string>(1);
    return queue;
  })
);

// Create a scope for resources used in the configuration layer
const scope = Effect.runSync(Scope.make());

// Transform the configuration layer into a runtime
const runtime = await Effect.runPromise(
  Layer.toRuntime(throttlerLayer).pipe(Scope.extend(scope))
);

// Define a custom running function
const runPromise = Runtime.runPromise(runtime);

/*
Output:
Application started!
*/

// Cleaning up any resources used by the configuration layer
Effect.runFork(Scope.close(scope, Exit.void));


type Options = {
  capacity: number;
  type: 'sliding' | 'dropping' | 'bounded';
};

const defaults: Options = {
  capacity: 1,
  type: 'sliding',
};

const processQueue = <T>(queue: Queue.Dequeue<T>) =>
  Effect.forever(
    Effect.gen(function* () {
      const item = yield* Queue.take(queue);
      console.log(`Processing item: ${JSON.stringify(item)}`);
      yield* Effect.sleep(100);
    })
  );

const program = pipe(
  Cache.make({
    capacity: 1,
    lookup: () =>
      Effect.gen(function* () {
        const queue = yield* Queue.sliding<string>(1);
        const fiber = yield* Effect.forkDaemon(processQueue(queue));
        return { fiber, queue } as const;
      }),
    timeToLive: Duration.infinity,
  }),
  Effect.andThen((cache) =>
    Effect.gen(function* () {
      const { queue, fiber } = yield* cache.get('cache');

      yield* pipe(queue, Queue.offer('foo'));
      yield* Effect.sleep(1000);
      yield* Fiber.interrupt(fiber);
      // const hits = yield* cache.cacheStats.pipe(Effect.map((_) => _.hits));
      // const misses = yield* cache.cacheStats.pipe(Effect.map((_) => _.misses));
      // console.log(`Number of cache hits: ${hits}`);
      // console.log(`Number of cache misses: ${misses}`);
    })
  )
);

void Effect.runPromise(program);

export const useEffectQueue = <T>(options: Options = defaults) => {
  const fiberRef = React.useRef<Fiber.Fiber<never> | null>(null);
  const queueRef = React.useRef<Queue.Enqueue<T> | null>(null);

  React.useEffect(() => {
    const ctrl = new AbortController();
    void Effect.runPromise(
      pipe(
        Effect.gen(function* () {
          const queue = yield* Queue[options.type]<T>(options.capacity);
          const fiber = yield* Effect.forkDaemon(processQueue(queue));
          return { fiber, queue } as const;
        }),
        Effect.tap(({ queue, fiber }) => {
          queueRef.current = queue;
          fiberRef.current = fiber;
        })
      ),
      { signal: ctrl.signal }
    );

    return () => {
      ctrl.abort();
      if (fiberRef.current) {
        void Effect.runPromise(Fiber.interrupt(fiberRef.current));
      }
    };
  }, []);

  return queueRef;
};
