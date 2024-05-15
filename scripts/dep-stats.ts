import * as fs from 'fs';
import * as util from 'util';
import axios from 'axios';
import chalk from 'chalk';
// @ts-expect-error isolatedModules disabled?
import dayjs from 'dayjs';
import { pipe, Effect as E, flow, Console } from 'effect';
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
    this.PACKAGE_JSON_PATH = PACKAGE_JSON_PATH;
  }

  public analyze() {
    const App = pipe(this.PACKAGE_JSON_PATH, this.logStats, E.runPromise);
    // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
    App.catch(Console.error);
  }

  private readonly formatDateInterval = (from: dayjs.Dayjs, to: dayjs.Dayjs) =>
    `${from.format('YYYY-MM-DD')}:${to.format('YYYY-MM-DD')}`;

  private readonly dateRanges = {
    lastMonth: () =>
      this.formatDateInterval(
        dayjs().subtract(1, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'day')
      ),
    lastMonthPrevYear: () =>
      this.formatDateInterval(
        dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'year').subtract(1, 'day')
      ),
    prevMonth: () =>
      this.formatDateInterval(
        dayjs().subtract(2, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'month').subtract(1, 'day')
      ),
    prevMonthPrevYear: () =>
      this.formatDateInterval(
        dayjs().subtract(1, 'year').subtract(2, 'month').subtract(1, 'day'),
        dayjs().subtract(1, 'year').subtract(1, 'month').subtract(1, 'day')
      ),
  };

  private readonly readFile = (path: string) =>
    E.tryPromise(() => util.promisify(fs.readFile)(path, 'utf-8'));

  private readonly getDependencies = flow(
    this.readFile,
    E.mapError((err) => new Error(`Failed to read file: ${err.message}`)),
    E.andThen((data) =>
      E.try(() => {
        const packageJson = JSON.parse(data) as PackageJson;
        return merge(packageJson.devDependencies, packageJson.dependencies);
      })
    )
  );

  private readonly fetchData = (packageName: string, period: string) =>
    E.tryPromise<{ data: DownloadData }>(() =>
      axios.get(`${this.NPM_API_BASE_URL}/${period}/${packageName}`)
    );

  private readonly rChange = (current: number, previous: number) => () =>
    ((current - previous) / Math.max(previous, 1)) * 100;

  private readonly calculateRoC = (current: number, prev: number) => {
    const denominator =
      (Math.abs(prev) + Math.abs(current)) / 2 + Number.EPSILON;
    return ((current - prev) / denominator) * 100;
  };

  private readonly getPackageData = flow(
    this.fetchData,
    E.mapError(({ message }) => new Error(`Failed to fetch: ${message}`)),
    E.map(({ data }) => data.downloads)
  );

  private readonly getResults = (dep: string) =>
    pipe(
      E.all(
        [
          this.getPackageData(dep, this.dateRanges.prevMonth()),
          this.getPackageData(dep, this.dateRanges.prevMonthPrevYear()),
          this.getPackageData(dep, this.dateRanges.lastMonth()),
          this.getPackageData(dep, this.dateRanges.lastMonthPrevYear()),
        ],
        { concurrency: 4 }
      ),
      E.andThen(
        ([prevMonth, prevMonthPrevYear, lastMonth, lastMonthPrevYear]) =>
          E.Do.pipe(
            E.let('lastMonth', () => lastMonth),
            E.let('rChangeRecent', this.rChange(lastMonth, prevMonth)),
            E.let('rChangePrev', this.rChange(prevMonth, prevMonthPrevYear)),
            E.let('rChange', this.rChange(lastMonth, lastMonthPrevYear)),
            E.let('rateOfChange', ({ rChange, rChangePrev }) =>
              this.calculateRoC(rChange, rChangePrev)
            )
          )
      )
    );

  private readonly getDepStats = flow(
    this.getDependencies,
    E.andThen((dependencies) =>
      E.forEach(
        Object.keys(dependencies),
        (dep) =>
          E.Do.pipe(
            E.let('name', () => dep),
            E.tap(() => Console.log(`Fetching stats for ${dep}`)),
            E.bind('data', ({ name }) => this.getResults(name))
          ),
        { concurrency: 5 }
      )
    )
  );

  private readonly logStats = flow(
    this.getDepStats,
    E.andThen((data) =>
      E.forEach(data, ({ data, name }) =>
        E.Do.pipe(
          E.let('rocColor', () => (data.rateOfChange > 0 ? 'green' : 'red')),
          E.let('rColor', () => (data.rChangeRecent > 0 ? 'green' : 'red')),
          E.tap(({ rocColor, rColor }) => {
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
