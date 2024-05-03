import fs from 'fs';
import axios from 'axios';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { merge } from 'remeda';

// const PersonId = S.Number;

// const Person = S.Struct({
//   id: PersonId,
//   name: S.String,
//   age: S.Number,
// });

// const asyncSchema = S.transformOrFail(PersonId, Person, {
//   // Simulate an async transformation
//   decode: (id) =>
//     Effect.succeed({ id, name: 'name', age: 18 }).pipe(
//       Effect.delay('1000 millis')
//     ),
//   encode: (person) => Effect.succeed(person.id).pipe(Effect.delay('10 millis')),
// });

// const syncParsePersonId = S.decodeUnknownEither(asyncSchema);

// console.log(JSON.stringify(syncParsePersonId(1), null, 2));
/*
Output:
{
  "_id": "Either",
  "_tag": "Left",
  "left": {
    "_id": "ParseError",
    "message": "(number <-> { id: number; name: string; age: number })\n└─ cannot be be resolved synchronously, this is caused by using runSync on an effect that performs async work"
  }
}
*/

// const asyncParsePersonId = S.decodeUnknown(asyncSchema);

// Effect.runPromise(asyncParsePersonId(1)).then(console.log);
/*
Output:
{ id: 1, name: 'name', age: 18 }
*/

// const Person = S.Struct({
//   name: S.String,
//   age: S.Number,
// });

// const decode = S.decodeUnknownEither(Person);

// // Simulate an unknown input
// const input: unknown = { name: 'Alice', age: 30 };

// const result1 = decode(input);
// if (Either.isRight(result1)) {
//   console.log(result1.right);
//   /*
//   Output:
//   { name: "Alice", age: 30 }
//   */
// }

// const result2 = decode(null);
// if (Either.isLeft(result2)) {
//   console.log(result2.left);
//   /*
//   Output:
//   {
//     _id: 'ParseError',
//     message: 'Expected { name: string; age: number }, actual null'
//   }
//   */
// }

// const Person = S.Struct({
//   name: S.String,
//   age: S.Number,
// });

// // Simulate an unknown input
// const input: unknown = { name: 'Alice', age: 30 };

// console.log(S.decodeUnknownSync(Person)(input));
// // Output: { name: 'Alice', age: 30 }

// console.log(S.decodeUnknownSync(Person)(null));

// const Person = S.Struct({
//   name: S.String,
//   age: S.NumberFromString,
// });

// interface Person extends S.Schema.Type<typeof Person> {}

// type Person2 = S.Schema.Type<typeof Person>

// type PersonEncoded = S.Schema.Encoded<typeof Person>

// const person: Person = { name: 'John Doe', age: 42 };

// const increment0 = (x: number) => x + 1;
// const double = (x: number) => x * 2;
// const subtractTen = (x: number) => x - 10;
// const result = pipe(5, increment0, double, subtractTen);
// console.log(result); // Output: 2

// const divide0 = (a: number, b: number): Effect.Effect<number, Error> =>
//   b === 0
//     ? Effect.fail(new Error('Cannot divide by zero'))
//     : Effect.succeed(a / b);
// const flatMappedEffect = pipe(
//   Effect.succeed([10, 2]),
//   Effect.flatMap(([a, b]) => divide0(a, b))
// );
// void Effect.runPromise(flatMappedEffect).then(console.log); // Output: 5

// Effect.flatMap(([a, b]) => {
//   Effect.sync(() => console.log(`Performing division: ${a} / ${b}`));
//   return divide0(a, b);
// });

// const program0 = pipe(
//   Effect.succeed([10, 2]),
//   Effect.tap(([a, b]) =>
//     Effect.sync(() => console.log(`Performing division: ${a} / ${b}`))
//   ),
//   // [a, b] is still available!
//   Effect.flatMap(([a, b]) => divide0(a, b))
// );
// void Effect.runPromise(program0).then(console.log);
// /*
// Output:
// Performing division: 10 / 2
// 5
// */

// const foo = Effect.succeed(42);
// const bar = Effect.succeed('Hello');
// const combinedEffect = Effect.all([foo, bar]);
// void Effect.runPromise(combinedEffect).then(console.log); // Output: [42, "Hello"]

// const increment = (x: number) => x + 1;
// const divide = (a: number, b: number): Effect.Effect<number, Error> =>
//   b === 0
//     ? Effect.fail(new Error('Cannot divide by zero'))
//     : Effect.succeed(a / b);

// const task1 = Effect.promise(() => Promise.resolve(10));
// const task2 = Effect.promise(() => Promise.resolve(2));

// const program = pipe(
//   Effect.all([task1, task2]),
//   Effect.flatMap(([a, b]) => divide(a, b)),
//   Effect.map((n1) => increment(n1)),
//   Effect.map((n2) => `Result is: ${n2.toString()}`)
// );

// void Effect.runPromise(program).then(console.log); // Output: "Result is: 6"

// const getTodo = (id: number) =>
//   Effect.tryPromise({
//     try: () =>
//       fetch(`https://jsonplaceholder.typicode.com/todos/${id.toString()}`),
//     catch: (unknown) => new Error(`something went wrong ${unknown as string}`), // remap the error
//   });

// const program = getTodo(3);
// void Effect.runPromise(program).then((data) => data.json().then(console.log));

// let i = 0;

// const good = Effect.suspend(() => Effect.succeed(i++));

// console.log(Effect.runSync(good)); // Output: 1
// console.log(Effect.runSync(good)); // Output: 2

// const allGood = (n: number): Effect.Effect<number> =>
//   n < 2
//     ? Effect.succeed(1)
//     : Effect.zipWith(
//         Effect.suspend(() => allGood(n - 1)),
//         Effect.suspend(() => allGood(n - 2)),
//         (a, b) => a + b
//       );

// console.log(Effect.runSync(allGood(32))); // Output: 3524578

// const ugly = (a: number, b: number) =>
//   b === 0
//     ? Effect.fail(new Error('Cannot divide by zero'))
//     : Effect.succeed(a / b);

// const nice = (a: number, b: number) =>
//   Effect.suspend(() =>
//     b === 0
//       ? Effect.fail(new Error('Cannot divide by zero'))
//       : Effect.succeed(a / b)
//   );
//
interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface DownloadData {
  downloads: number;
  end: string;
  package: string;
  start: string;
}

const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
const oneYearAndSevenDaysAgo = dayjs()
  .subtract(1, 'year')
  .subtract(7, 'days')
  .format('YYYY-MM-DD');

// Read and parse the package.json to get dependencies
const getDependencies = (path: string) => {
  const fileData: string = fs.readFileSync(path, 'utf8');
  const packageJson: PackageJson = JSON.parse(fileData) as PackageJson;

  return merge(packageJson.dependencies!, packageJson.devDependencies!);
};

const lastWeek = `last-week`;
const oneYearAgoLastWeek = `${oneYearAndSevenDaysAgo}:${oneYearAgo}`;

// Fetch download data from npm for a given package
const fetchDownloads = async (packageName: string, period: string) => {
  const url = `https://api.npmjs.org/downloads/point/${period}/${packageName}`;
  try {
    const response = await axios.get(url);
    return response.data as DownloadData; // Explicitly casting the response data to the DownloadData type
  } catch (error) {
    console.error(
      `Failed to fetch downloads for ${packageName}: ${error as string}`
    );
    return null;
  }
};

// const fetchByPeriod = (period: string) => (dep: string) =>
//   fetchDownloads(dep, period);

// Example usage of fetching downloads
async function showDownloads() {
  const dependencies = getDependencies('./package.json');

  // // eslint-disable-next-line @typescript-eslint/no-floating-promises
  // pipe(
  //   Object.keys(dependencies),
  //   R.ap([fetchByPeriod(lastWeek), fetchByPeriod(oneYearAgoLastWeek)])
  // );

  for (const dep in dependencies) {
    const lastWeekData = await fetchDownloads(dep, lastWeek);
    const oneYearAgoData = await fetchDownloads(dep, oneYearAgoLastWeek);

    if (lastWeekData && oneYearAgoData) {
      const relativeChange =
        ((lastWeekData.downloads - oneYearAgoData.downloads) /
          Math.max(oneYearAgoData.downloads, 1)) *
        100;
      const relativeChangeColor = relativeChange > 0 ? 'green' : 'red';

      console.log(
        `${chalk.blue(dep)}: ${chalk.yellow.bold(lastWeekData.downloads.toString())} downloads (last week), ${chalk[relativeChangeColor](relativeChange.toFixed(2))}%`
      );
    }
  }
}

void showDownloads();
