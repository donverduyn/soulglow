// import { Effect, Context, Layer } from 'effect';
// // Create a tag for the Config service
// class Config extends Context.Tag('Config')<
//   Config,
//   {
//     readonly getConfig: Effect.Effect<{
//       readonly connection: string;
//       readonly logLevel: string;
//     }>;
//   }
// >() {}
// const ConfigLive = Layer.succeed(
//   Config,
//   Config.of({
//     getConfig: Effect.succeed({
//       connection: 'mysql://username:password@hostname:port/database_name',
//       logLevel: 'INFO',
//     }),
//   })
// );

// class Logger extends Context.Tag('Logger')<
//   Logger,
//   { readonly log: (message: string) => Effect.Effect<void> }
// >() {}
// const LoggerLive = Layer.effect(
//   Logger,
//   Effect.gen(function* () {
//     const config = yield* Config;
//     return {
//       log: (message) =>
//         Effect.gen(function* () {
//           const { logLevel } = yield* config.getConfig;
//           console.log(`[${logLevel}] ${message}`);
//         }),
//     };
//   })
// );

// class Database extends Context.Tag('Database')<
//   Database,
//   { readonly query: (sql: string) => Effect.Effect<unknown> }
// >() {}
// const DatabaseLive = Layer.effect(
//   Database,
//   Effect.gen(function* () {
//     const config = yield* Config;
//     const logger = yield* Logger;
//     return {
//       query: (sql: string) =>
//         Effect.gen(function* () {
//           yield* logger.log(`Executing query: ${sql}`);
//           const { connection } = yield* config.getConfig;
//           return { result: `Results from ${connection}` };
//         }),
//     };
//   })
// );

// const MainLive = DatabaseLive.pipe(
//   // provides the config and logger to the database
//   Layer.provide(Layer.merge(ConfigLive, LoggerLive)),
//   // provides the config to AppConfigLive
//   Layer.provideMerge(ConfigLive)
// );
// const program = Effect.gen(function* () {
//   const database = yield* Database;
//   const result = yield* database.query('SELECT * FROM users');
//   return yield* Effect.succeed(result);
// });
// const runnable = Effect.provide(program, MainLive);

// export const view = () => {
//   void Effect.runPromise(runnable).then(console.log);
// };

/*
Output:
[INFO] Executing query: SELECT * FROM users
{
  result: 'Results from mysql://username:password@hostname:port/database_name'
}
*/

// import * as fs from 'fs';
// import * as util from 'util';
// import axios from 'axios';
// import chalk from 'chalk';
// import dayjs from 'dayjs';
// import { pipe, Effect as Effect, Console, Context, Layer } from 'effect';
// import type { UnknownException } from 'effect/Cause';
// import { merge } from 'remeda';

// interface PackageJson {
//   dependencies?: Record<string, string>;
//   devDependencies?: Record<string, string>;
// }

// interface DownloadData {
//   downloads: number;
//   end: string;
//   package: string;
//   start: string;
// }

// const PACKAGE_JSON_PATH: string = './package.json';
// const NPM_API_BASE_URL = 'https://api.npmjs.org/downloads/point';

// // Config Service
// class Config extends Context.Tag('Config')<
//   Config,
//   {
//     readonly getNpmApiBaseUrl: Effect.Effect<string>;
//     readonly getPackageJsonPath: Effect.Effect<string>;
//   }
// >() {}

// const ConfigLive = Layer.succeed(
//   Config,
//   Config.of({
//     getNpmApiBaseUrl: Effect.succeed(NPM_API_BASE_URL),
//     getPackageJsonPath: Effect.succeed(PACKAGE_JSON_PATH),
//   })
// );

// // Logger Service
// class Logger extends Context.Tag('Logger')<
//   Logger,
//   { readonly log: (message: string) => Effect.Effect<void> }
// >() {}

// const LoggerLive = Layer.succeed(
//   Logger,
//   Logger.of({
//     log: (message) =>
//       Effect.succeed(() => {
//         console.log(message);
//       }),
//   })
// );

// // FileReader Service
// class FileReader extends Context.Tag('FileReader')<
//   FileReader,
//   { readonly readFile: (path: string) => Effect.Effect<string> }
// >() {}

// const FileReaderLive = Layer.succeed(
//   FileReader,
//   FileReader.of({
//     readFile: (path) =>
//       Effect.tryPromise(() => util.promisify(fs.readFile)(path, 'utf-8')),
//   })
// );

// // PackageDataFetcher Service
// class PackageDataFetcher extends Context.Tag('PackageDataFetcher')<
//   PackageDataFetcher,
//   {
//     readonly fetchData: (
//       packageName: string,
//       period: string
//     ) => Effect.Effect<DownloadData, Error>;
//   }
// >() {}

// const PackageDataFetcherLive = Layer.effect(
//   PackageDataFetcher,
//   Effect.gen(function* () {
//     const config = yield* Config;
//     const npmApiBaseUrl = yield* config.getNpmApiBaseUrl;
//     return {
//       fetchData: (packageName, period) =>
//         Effect.tryPromise(() =>
//           axios.get<DownloadData>(`${npmApiBaseUrl}/${period}/${packageName}`)
//         ).pipe(
//           Effect.mapError(
//             ({ message }) => new Error(`Failed to fetch: ${message}`)
//           ),
//           Effect.map(({ data }) => data)
//         ),
//     };
//   })
// );

// // Helper functions
// const formatDateInterval = (from: dayjs.Dayjs, to: dayjs.Dayjs) =>
//   `${from.format('YYYY-MM-DD')}:${to.format('YYYY-MM-DD')}`;

// const dateRanges = {
//   lastMonth: () =>
//     formatDateInterval(
//       dayjs().subtract(1, 'month').subtract(1, 'day'),
//       dayjs().subtract(1, 'day')
//     ),
//   lastMonthPrevYear: () =>
//     formatDateInterval(
//       dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day'),
//       dayjs().subtract(1, 'year').subtract(1, 'day')
//     ),
//   prevMonth: () =>
//     formatDateInterval(
//       dayjs().subtract(2, 'month').subtract(1, 'day'),
//       dayjs().subtract(1, 'month').subtract(1, 'day')
//     ),
//   prevMonthPrevYear: () =>
//     formatDateInterval(
//       dayjs().subtract(1, 'year').subtract(2, 'month').subtract(1, 'day'),
//       dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day')
//     ),
// };

// const rChange = (current: number, previous: number) => () =>
//   ((current - previous) / Math.max(previous, 1)) * 100;

// const calculateRoC = (current: number, prev: number) => {
//   const denominator = (Math.abs(prev) + Math.abs(current)) / 2 + Number.EPSILON;
//   return ((current - prev) / denominator) * 100;
// };

// // Main functions refactored to use Effect.gen
// const getDependencies = Effect.gen(function* () {
//   const config = yield* Config;
//   const fileReader = yield* FileReader;

//   const path = yield* config.getPackageJsonPath;
//   const data = yield* fileReader.readFile(path);
//   const packageJson = JSON.parse(data) as PackageJson;
//   return merge(packageJson.devDependencies, packageJson.dependencies);
// });

// const getPackageData = (packageName: string, period: string) =>
//   Effect.gen(function* () {
//     const fetcher = yield* PackageDataFetcher;
//     return yield* fetcher.fetchData(packageName, period);
//   });

// const getResults = (dep: string) =>
//   Effect.gen(function* () {
//     const [prevMonth, prevMonthPrevYear, lastMonth, lastMonthPrevYear] =
//       yield* Effect.all(
//         [
//           getPackageData(dep, dateRanges.prevMonth()),
//           getPackageData(dep, dateRanges.prevMonthPrevYear()),
//           getPackageData(dep, dateRanges.lastMonth()),
//           getPackageData(dep, dateRanges.lastMonthPrevYear()),
//         ],
//         { concurrency: 4 }
//       );

//     const lastMonthDownloads = lastMonth.downloads;
//     const rChangeRecent = rChange(lastMonthDownloads, prevMonth.downloads)();
//     const rChangePrev = rChange(
//       prevMonth.downloads,
//       prevMonthPrevYear.downloads
//     )();
//     const rChangeCurrent = rChange(
//       lastMonthDownloads,
//       lastMonthPrevYear.downloads
//     )();
//     const rateOfChange = calculateRoC(rChangeCurrent, rChangePrev);

//     return {
//       lastMonth: lastMonthDownloads,
//       rChangeCurrent,
//       rChangePrev,
//       rChangeRecent,
//       rateOfChange,
//     };
//   });

// const getDepStats = Effect.gen(function* () {
//   const logger = yield* Logger;
//   const dependencies = yield* getDependencies;

//   return yield* Effect.forEach(
//     Object.keys(dependencies!),
//     (dep) =>
//       Effect.gen(function* () {
//         yield* logger.log(`Fetching stats for ${dep}`);
//         const data = yield* getResults(dep);
//         return { data, name: dep };
//       }),
//     { concurrency: 5 }
//   );
// });

// const logStats = Effect.gen(function* () {
//   const logger = yield* Logger;
//   const depStats = yield* getDepStats;

//   return yield* Effect.forEach(depStats, ({ data, name }) =>
//     Effect.gen(function* () {
//       const rocColor = data.rateOfChange > 0 ? 'green' : 'red';
//       const rColor = data.rChangeRecent > 0 ? 'green' : 'red';

//       yield* logger.log(
//         `${chalk.blue(name)}: ${chalk.yellow.bold(data.lastMonth.toString())} downloads (last month),
//         RoC: ${chalk[rocColor](data.rateOfChange.toFixed(2))}%,
//         prev: ${data.rChangePrev.toFixed(2)}%, current: ${data.rChangeCurrent.toFixed(2)}%,
//         mo/mo ${chalk[rColor](data.rChangeRecent.toFixed(2))}%
//         `.replace(/\s+/g, ' ')
//       );
//     })
//   );
// });

// // Main function
// export const view = (path: string = PACKAGE_JSON_PATH) => {
//   const App = pipe(
//     logStats,
//     Effect.provide(
//       Layer.merge(
//         ConfigLive,
//         LoggerLive,
//         // FileReaderLive,
//         // PackageDataFetcherLive
//       )
//     ),
//     Effect.runPromise
//   );

//   App.catch(Console.error);
// };

import * as fs from 'fs';
import * as util from 'util';
import axios from 'axios';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { pipe, Effect as Effect, flow, Console } from 'effect';
import { merge } from 'remeda';

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

const PACKAGE_JSON_PATH: string = './package.json';
const NPM_API_BASE_URL = 'https://api.npmjs.org/downloads/point';

export const view = (path: string = PACKAGE_JSON_PATH) => {
  const App = pipe(path, logStats, Effect.runPromise);
  // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
  App.catch(Console.error);
};

const formatDateInterval = (from: dayjs.Dayjs, to: dayjs.Dayjs) =>
  `${from.format('YYYY-MM-DD')}:${to.format('YYYY-MM-DD')}`;

const dateRanges = {
  lastMonth: () =>
    formatDateInterval(
      dayjs().subtract(1, 'month').subtract(1, 'day'),
      dayjs().subtract(1, 'day')
    ),
  lastMonthPrevYear: () =>
    formatDateInterval(
      dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day'),
      dayjs().subtract(1, 'year').subtract(1, 'day')
    ),
  prevMonth: () =>
    formatDateInterval(
      dayjs().subtract(2, 'month').subtract(1, 'day'),
      dayjs().subtract(1, 'month').subtract(1, 'day')
    ),
  prevMonthPrevYear: () =>
    formatDateInterval(
      dayjs().subtract(1, 'year').subtract(2, 'month').subtract(1, 'day'),
      dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day')
    ),
};

const fetchData = (packageName: string, period: string) =>
  Effect.tryPromise<{ data: DownloadData }>(() =>
    axios.get(`${NPM_API_BASE_URL}/${period}/${packageName}`)
  );

const rChange = (current: number, previous: number) => () =>
  ((current - previous) / Math.max(previous, 1)) * 100;

const calculateRoC = (current: number, prev: number) => {
  const denominator = (Math.abs(prev) + Math.abs(current)) / 2 + Number.EPSILON;
  return ((current - prev) / denominator) * 100;
};

const getPackageData = flow(
  fetchData,
  Effect.mapError(({ message }) => new Error(`Failed to fetch: ${message}`)),
  Effect.map(({ data }) => data.downloads)
);

const readFile = (path: string) =>
  Effect.tryPromise(() => util.promisify(fs.readFile)(path, 'utf-8'));

const getResults = (dep: string) =>
  pipe(
    Effect.all(
      [
        getPackageData(dep, dateRanges.prevMonth()),
        getPackageData(dep, dateRanges.prevMonthPrevYear()),
        getPackageData(dep, dateRanges.lastMonth()),
        getPackageData(dep, dateRanges.lastMonthPrevYear()),
      ],
      { concurrency: 4 }
    ),
    Effect.andThen(
      ([prevMonth, prevMonthPrevYear, lastMonth, lastMonthPrevYear]) =>
        Effect.Do.pipe(
          Effect.let('lastMonth', () => lastMonth),
          Effect.let('rChangeRecent', rChange(lastMonth, prevMonth)),
          Effect.let('rChangePrev', rChange(prevMonth, prevMonthPrevYear)),
          Effect.let('rChange', rChange(lastMonth, lastMonthPrevYear)),
          Effect.let('rateOfChange', ({ rChange, rChangePrev }) =>
            calculateRoC(rChange, rChangePrev)
          )
        )
    )
  );

const getDependencies = flow(
  readFile,
  Effect.mapError((err) => new Error(`Failed to read file: ${err.message}`)),
  Effect.andThen((data) =>
    Effect.try(() => {
      const packageJson = JSON.parse(data) as PackageJson;
      return merge(packageJson.devDependencies, packageJson.dependencies);
    })
  )
);

const getDepStats = flow(
  getDependencies,
  Effect.andThen((dependencies) =>
    Effect.forEach(
      Object.keys(dependencies!),
      (dep) =>
        Effect.Do.pipe(
          Effect.let('name', () => dep),
          Effect.tap(() => Console.log(`Fetching stats for ${dep}`)),
          Effect.bind('data', ({ name }) => getResults(name))
        ),
      { concurrency: 5 }
    )
  )
);

const logStats = flow(
  getDepStats,
  Effect.andThen((data) =>
    Effect.forEach(data, ({ data, name }) =>
      Effect.Do.pipe(
        Effect.let('rocColor', () => (data.rateOfChange > 0 ? 'green' : 'red')),
        Effect.let('rColor', () => (data.rChangeRecent > 0 ? 'green' : 'red')),
        Effect.tap(({ rocColor, rColor }) => {
          console.log(
            `${chalk.blue(name)}: ${chalk.yellow.bold(data.lastMonth.toString())} downloads (last month),
              RoC: ${chalk[rocColor](data.rateOfChange.toFixed(2))}%,
              prev: ${data.rChangePrev.toFixed(2)}%, current: ${data.rChange.toFixed(2)}%,
              mo/mo ${chalk[rColor](data.rChangeRecent.toFixed(2))}%
              `.replace(/\s+/g, ' ')
          );
        })
      )
    )
  )
);

// import * as fs from 'fs';
// import * as util from 'util';
// import axios, { AxiosResponse } from 'axios';
// import chalk from 'chalk';
// import dayjs from 'dayjs';
// import { pipe, Effect as $, Console } from 'effect';
// import { merge } from 'remeda';

// interface PackageJson {
//   dependencies?: Record<string, string>;
//   devDependencies?: Record<string, string>;
// }

// interface DownloadData {
//   downloads: number;
// }

// interface DateRangeFn {
//   (): string;
// }

// interface FetchDataFn {
//   (
//     axiosGet: typeof axios.get,
//     baseURL: string,
//     packageName: string,
//     period: string
//   ): Promise<AxiosResponse<{ data: DownloadData }>>;
// }

// interface GetPackageDataFn {
//   (
//     axiosGet: typeof axios.get,
//     baseURL: string,
//     packageName: string,
//     dateRangeFn: DateRangeFn
//   ): string;
// }

// interface LogStatsFn {
//   (
//     ConsoleLog: typeof Console.log,
//     chalkInstance: typeof chalk,
//     getPackageDataFn: GetPackageDataFn,
//     axiosGet: typeof axios.get,
//     baseURL: string,
//     dependencies: Record<string, string>
//   ): void;
// }

// // Constants
// const PACKAGE_JSON_PATH: string = './package.json';
// const NPM_API_BASE_URL = 'https://api.npmjs.org/downloads/point';

// // Utilities
// const readFile = (fsReadFile: typeof fs.readFile, path: string) =>
//   $.tryPromise(() => util.promisify(fsReadFile)(path, 'utf-8'));

// const parseJSON = <T>(text: string) => $.try<T>(() => JSON.parse(text) as T);

// const formatDateInterval = (from: dayjs.Dayjs, to: dayjs.Dayjs): string =>
//   `${from.format('YYYY-MM-DD')}:${to.format('YYYY-MM-DD')}`;

// const calculateRateOfChange = (current: number, previous: number): number =>
//   ((current - previous) / (Math.abs(previous) + Number.EPSILON)) * 100;

// // API Calls
// const fetchData = (
//   axiosGet: typeof axios.get,
//   baseURL: string,
//   packageName: string,
//   period: string
// ) => $.tryPromise(() => axiosGet(`${baseURL}/${period}/${packageName}`));

// // Core Logic
// const getPackageData = (
//   axiosGet: typeof axios.get,
//   baseURL: string,
//   packageName: string,
//   dateRangeFn: DateRangeFn
// ) =>
//   pipe(
//     $.all([
//       fetchData(axiosGet, baseURL, packageName, dateRangeFn()),
//       fetchData(axiosGet, baseURL, packageName, dateRangeFn()),
//     ]),
//     $.map(([lastMonthData, lastYearData]) => ({
//       lastMonth: lastMonthData.data.downloads,
//       lastYear: lastYearData.data.downloads,
//       rateOfChange: calculateRateOfChange(
//         lastMonthData.data.downloads,
//         lastYearData.data.downloads
//       ),
//     }))
//   );

// const logStats = (
//   log: typeof Console.log,
//   chalkInstance: typeof chalk,
//   getPackageDataFn: GetPackageDataFn,
//   axiosGet: typeof axios.get,
//   baseURL: string,
//   dependencies: Record<string, string>
// ) =>
//   $.forEach(
//     Object.entries(dependencies),
//     ([name, version]) =>
//       $.bind('data', () =>
//         getPackageDataFn(axiosGet, baseURL, name, () =>
//           formatDateInterval(dayjs().subtract(1, 'month'), dayjs())
//         )
//       ),
//     $.tap(({ data }) => {
//       log(
//         `${chalkInstance.blue(name)}: ${chalkInstance.yellow(data.lastMonth.toString())} downloads, ` +
//           `RoC: ${chalkInstance[data.rateOfChange > 0 ? 'green' : 'red'](
//             data.rateOfChange.toFixed(2)
//           )}%`
//       );
//     })
//   );

// const analyze = (
//   readFileFn: typeof readFile,
//   parseJSONFn: typeof parseJSON<PackageJson>,
//   logStatsFn: LogStatsFn,
//   getPackageDataFn: GetPackageDataFn,
//   fsReadFile: typeof fs.readFile,
//   axiosGet: typeof axios.get,
//   log: typeof Console.log,
//   chalkInstance: typeof chalk,
//   path: string
// ) =>
//   pipe(
//     readFileFn(fsReadFile, path),
//     $.mapError(
//       (err: Error) => new Error(`Failed to read file: ${err.message}`)
//     ),
//     $.andThen(parseJSONFn),
//     $.map(({ dependencies, devDependencies }) =>
//       merge(devDependencies || {}, dependencies || {})
//     ),
//     $.andThen((dependencies) =>
//       logStatsFn(
//         log,
//         chalkInstance,
//         getPackageDataFn,
//         axiosGet,
//         NPM_API_BASE_URL,
//         dependencies
//       )
//     ),
//     $.runPromise
//   );

// // Execution

// export const view = (path: string = PACKAGE_JSON_PATH) =>
//   analyze(
//     readFile,
//     parseJSON,
//     logStats,
//     getPackageData,
//     fs.readFile,
//     axios.get,
//     Console.log,
//     chalk,
//     path
//     // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
//   ).catch(Console.error);
