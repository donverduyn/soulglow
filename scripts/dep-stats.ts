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

class NpmPackageAnalyzer {
  private readonly PACKAGE_JSON_PATH: string = './package.json';
  private readonly NPM_API_BASE_URL = 'https://api.npmjs.org/downloads/point';

  constructor(PACKAGE_JSON_PATH?: string) {
    this.PACKAGE_JSON_PATH = PACKAGE_JSON_PATH ?? this.PACKAGE_JSON_PATH;
  }

  public analyze() {
    const App = pipe(this.PACKAGE_JSON_PATH, this.#logStats, $.runPromise);
    // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
    App.catch(Console.error);
  }

  readonly #formatDateInterval = (from: dayjs.Dayjs, to: dayjs.Dayjs) =>
    `${from.format('YYYY-MM-DD')}:${to.format('YYYY-MM-DD')}`;

  readonly #dateRanges = {
    lastMonth: () =>
      this.#formatDateInterval(
        dayjs().subtract(1, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'day')
      ),
    lastMonthPrevYear: () =>
      this.#formatDateInterval(
        dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'year').subtract(1, 'day')
      ),
    prevMonth: () =>
      this.#formatDateInterval(
        dayjs().subtract(2, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'month').subtract(1, 'day')
      ),
    prevMonthPrevYear: () =>
      this.#formatDateInterval(
        dayjs().subtract(1, 'year').subtract(2, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day')
      ),
  };

  readonly #fetchData = (packageName: string, period: string) =>
    $.tryPromise<{ data: DownloadData }>(() =>
      axios.get(`${this.NPM_API_BASE_URL}/${period}/${packageName}`)
    );

  readonly #rChange = (current: number, previous: number) => () =>
    ((current - previous) / Math.max(previous, 1)) * 100;

  readonly #calculateRoC = (current: number, prev: number) => {
    const denominator =
      (Math.abs(prev) + Math.abs(current)) / 2 + Number.EPSILON;
    return ((current - prev) / denominator) * 100;
  };

  readonly #getPackageData = flow(
    this.#fetchData,
    $.mapError(({ message }) => new Error(`Failed to fetch: ${message}`)),
    $.map(({ data }) => data.downloads)
  );

  readonly #readFile = (path: string) =>
    $.tryPromise(() => util.promisify(fs.readFile)(path, 'utf-8'));

  readonly #getResults = (dep: string) =>
    pipe(
      $.all(
        [
          this.#getPackageData(dep, this.#dateRanges.prevMonth()),
          this.#getPackageData(dep, this.#dateRanges.prevMonthPrevYear()),
          this.#getPackageData(dep, this.#dateRanges.lastMonth()),
          this.#getPackageData(dep, this.#dateRanges.lastMonthPrevYear()),
        ],
        { concurrency: 4 }
      ),
      $.andThen(
        ([prevMonth, prevMonthPrevYear, lastMonth, lastMonthPrevYear]) =>
          $.Do.pipe(
            $.let('lastMonth', () => lastMonth),
            $.let('rChangeRecent', this.#rChange(lastMonth, prevMonth)),
            $.let('rChangePrev', this.#rChange(prevMonth, prevMonthPrevYear)),
            $.let('rChange', this.#rChange(lastMonth, lastMonthPrevYear)),
            $.let('rateOfChange', ({ rChange, rChangePrev }) =>
              this.#calculateRoC(rChange, rChangePrev)
            )
          )
      )
    );

  readonly #getDependencies = flow(
    this.#readFile,
    $.mapError((err) => new Error(`Failed to read file: ${err.message}`)),
    $.andThen((data) =>
      $.try(() => {
        const packageJson = JSON.parse(data) as PackageJson;
        return merge(packageJson.devDependencies, packageJson.dependencies);
      })
    )
  );

  readonly #getDepStats = flow(
    this.#getDependencies,
    $.andThen((dependencies) =>
      $.forEach(
        Object.keys(dependencies!),
        (dep) =>
          $.Do.pipe(
            $.let('name', () => dep),
            $.tap(() => Console.log(`Fetching stats for ${dep}`)),
            $.bind('data', ({ name }) => this.#getResults(name))
          ),
        { concurrency: 5 }
      )
    )
  );

  readonly #logStats = flow(
    this.#getDepStats,
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
}

const analyzer = new NpmPackageAnalyzer('./package.json');
analyzer.analyze();
