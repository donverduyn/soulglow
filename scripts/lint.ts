import { spawn } from 'node:child_process';
import { Console, Context, Effect, flow, pipe } from 'effect';
import ora, { type Ora } from 'ora';

// we should ideally narrow down the type of the spinner
class Spinner extends Context.Tag('Spinner')<Spinner, Ora>() {}

const run = (command: string) =>
  pipe(
    Effect.sync(() => {
      const [cmd, ...args] = command.split(' ');
      return spawn(cmd, args, { shell: true, stdio: 'inherit' });
    }),
    Effect.andThen((child) =>
      pipe(
        Effect.tryPromise<number | null>(
          () =>
            new Promise((resolve, reject) => {
              child.on('close', resolve);
              child.on('error', reject);
            })
        ),
        Effect.mapBoth({
          onFailure: Effect.fail,
          onSuccess: (code) =>
            code !== 0
              ? Effect.fail('Lint Error')
              : Effect.succeed('Lint Passed'),
        })
      )
    )
  );

const runLintTasks = (commands: string[]) =>
  Effect.gen(function* () {
    const spinner = yield* Spinner;
    spinner.start();

    yield* pipe(
      Effect.all(
        commands.map((command) => run(command)),
        { concurrency: 'unbounded', mode: 'validate' }
      ),
      //   Effect.forEach(commands, run, { concurrency: 'unbounded' }),
      Effect.tap(Console.log),
      Effect.tap(() => spinner.stop())
    );
  });

export const lint = flow(
  runLintTasks,
  Effect.provide(Context.make(Spinner, ora({ color: 'gray' }))),
  Effect.runPromise
);

// to test this script
// const i: number = 'foo';
// void lint(['tsc']);
