import * as fs from 'fs';
import * as util from 'util';
import axios from 'axios';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { pipe, Effect as $, flow, Console } from 'effect';
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

export const analyze = (path: string = PACKAGE_JSON_PATH) => {
  const App = pipe(path, logStats, $.runPromise);
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
  $.tryPromise<{ data: DownloadData }>(() =>
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
  $.mapError(({ message }) => new Error(`Failed to fetch: ${message}`)),
  $.map(({ data }) => data.downloads)
);

const readFile = (path: string) =>
  $.tryPromise(() => util.promisify(fs.readFile)(path, 'utf-8'));

const getResults = (dep: string) =>
  pipe(
    $.all(
      [
        getPackageData(dep, dateRanges.prevMonth()),
        getPackageData(dep, dateRanges.prevMonthPrevYear()),
        getPackageData(dep, dateRanges.lastMonth()),
        getPackageData(dep, dateRanges.lastMonthPrevYear()),
      ],
      { concurrency: 4 }
    ),
    $.andThen(([prevMonth, prevMonthPrevYear, lastMonth, lastMonthPrevYear]) =>
      $.Do.pipe(
        $.let('lastMonth', () => lastMonth),
        $.let('rChangeRecent', rChange(lastMonth, prevMonth)),
        $.let('rChangePrev', rChange(prevMonth, prevMonthPrevYear)),
        $.let('rChange', rChange(lastMonth, lastMonthPrevYear)),
        $.let('rateOfChange', ({ rChange, rChangePrev }) =>
          calculateRoC(rChange, rChangePrev)
        )
      )
    )
  );

const getDependencies = flow(
  readFile,
  $.mapError((err) => new Error(`Failed to read file: ${err.message}`)),
  $.andThen((data) =>
    $.try(() => {
      const packageJson = JSON.parse(data) as PackageJson;
      return merge(packageJson.devDependencies, packageJson.dependencies);
    })
  )
);

const getDepStats = flow(
  getDependencies,
  $.andThen((dependencies) =>
    $.forEach(
      Object.keys(dependencies!),
      (dep) =>
        $.Do.pipe(
          $.let('name', () => dep),
          $.tap(() => Console.log(`Fetching stats for ${dep}`)),
          $.bind('data', ({ name }) => getResults(name))
        ),
      { concurrency: 5 }
    )
  )
);

const logStats = flow(
  getDepStats,
  $.andThen((data) =>
    $.forEach(data, ({ data, name }) =>
      $.Do.pipe(
        $.let('rocColor', () => (data.rateOfChange > 0 ? 'green' : 'red')),
        $.let('rColor', () => (data.rChangeRecent > 0 ? 'green' : 'red')),
        $.tap(({ rocColor, rColor }) => {
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
