import fs from 'fs';
import axios from 'axios';
import chalk from 'chalk';
import dayjs from 'dayjs';
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

const oneYearAgo = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
const oneYearAndOneMonthAgo = dayjs()
  .subtract(1, 'year')
  .subtract(1, 'month')
  .format('YYYY-MM-DD');
const oneYearAgoLastMonth = `${oneYearAndOneMonthAgo}:${oneYearAgo}`;

const today = dayjs().format('YYYY-MM-DD');
const oneMonthAgo = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
const lastMonth = `${oneMonthAgo}:${today}`;

// Read and parse the package.json to get dependencies
const getDependencies = (path: string) => {
  const fileData: string = fs.readFileSync(path, 'utf8');
  const packageJson: PackageJson = JSON.parse(fileData) as PackageJson;
  return merge(packageJson.dependencies!, packageJson.devDependencies!);
};

// Fetch download data from npm for a given package
const fetchDownloads = async (packageName: string, period: string) => {
  const url = `https://api.npmjs.org/downloads/point/${period}/${packageName}`;
  try {
    const response = await axios.get(url);
    return response.data as DownloadData;
  } catch (error) {
    console.error(
      `Failed to fetch downloads for ${packageName}: ${error as string}`
    );
    return null;
  }
};

// Example usage of fetching downloads
async function showDownloads() {
  const dependencies = getDependencies('./package.json');

  for (const dep in dependencies) {
    const lastWeekData = await fetchDownloads(dep, lastMonth);
    const oneYearAgoData = await fetchDownloads(dep, oneYearAgoLastMonth);

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
