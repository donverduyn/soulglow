import concurrently from 'concurrently';
import { Context, Effect, pipe } from 'effect';
import ora, { type Ora } from 'ora';

class Spinner extends Context.Tag('Spinner')<Spinner, Ora>() {}

const context = Context.empty().pipe(
  Context.add(Spinner, ora({ color: 'gray' }))
);

const run = (tasks: string[]) =>
  Effect.gen(function* () {
    const spinner = yield* Spinner;
    spinner.start();

    yield* pipe(
      Effect.tryPromise(() => concurrently(tasks, { raw: true }).result),
      Effect.catchAll((error) => Effect.fail(error)),
      Effect.tap(() => spinner.stop())
    );
  });

const tasks = [
  'tsc',
  'eslint ./**/*.{js,cjs,ts,tsx}',
  'stylelint "src/**/*.{css,tsx}"',
];

export const lint = () =>
  void Effect.runPromise(Effect.provide(pipe(tasks, run), context));
