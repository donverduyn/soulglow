import { spawn } from 'node:child_process';
import { Context, Effect, pipe } from 'effect';
import { default as ora, Ora } from 'ora';

// eslint-disable-next-line prettier/prettier
interface Spinnable { create: (options?: Parameters<typeof ora>[0]) => Ora }
class Spinner extends Context.Tag('Spinner')<Spinner, Spinnable>() {}

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
        Effect.orElse(() => Effect.fail('Unexpected Error')),
        Effect.tapError(() => Effect.sync(() => child.kill('SIGTERM'))),
        Effect.andThen((code) =>
          Effect.suspend(() =>
            code !== 0
              ? Effect.fail(`'${command}' Exited with code ${String(code)}`)
              : Effect.succeed('Lint Passed')
          )
        )
      )
    )
  );

const runLintTasks = (cmds: string[]) =>
  Effect.gen(function* () {
    const { create } = yield* Spinner;
    const spinner = create({ spinner: 'monkey' });

    yield* pipe(
      Effect.sync(() => spinner.start()),
      Effect.andThen(() =>
        Effect.all(cmds.map(run), {
          concurrency: 'unbounded',
          mode: 'validate',
        })
      ),
      Effect.tapError(() => Effect.sync(() => spinner.stop())),
      Effect.tap(() => spinner.stop())
    );
  });

export const lint = (tasks: string[]) =>
  pipe(
    runLintTasks(tasks),
    Effect.provide(
      Context.make(Spinner, {
        create: (options) => ora(Object.assign({ color: 'green' }, options)),
      })
    ),
    Effect.catchAll(() => Effect.sync(() => process.exit(1))),
    Effect.runPromise
  );

// to test this script
// const i: number = 'foo';
// void lint(['tsc']);
