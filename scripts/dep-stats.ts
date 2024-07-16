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
