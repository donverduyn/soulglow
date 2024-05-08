import { execSync } from 'child_process';
import puppeteer, { PuppeteerExtraPlugin } from 'puppeteer-extra';
import puppeteerPrefs from 'puppeteer-extra-plugin-user-preferences';

// this only works on linux inside the dev container for now
// because we bind mount /dev/snd
const getAlsaOutputDevice = (): string => {
  const command = 'aplay -l';
  const list = execSync(command);
  const result = list
    .toString()
    .split('\n')
    .filter((line) => line.startsWith('card'))[0]
    .split(',')
    .map((line) => line.split(':')[0])
    .map((line) => line.split(' ').reverse()[0])
    .join(',');
  return `hw:${result}`;
};

const launchOptions: Parameters<(typeof puppeteer)['launch']>[0] = {
  args: [
    `--alsa-output-device=${getAlsaOutputDevice()}`,
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-extensions-except=/tmp/react-devtools-extensions/unpacked',
    '--load-extension=/tmp/react-devtools-extensions/unpacked',
    // '--auto-accept-camera-and-microphone-capture',
    // '--force-dark-mode',
  ],
  defaultViewport: { height: 0, width: 0 },
  devtools: true,
  executablePath: puppeteer.executablePath(),
  headless: false,
  // dumpio: true,
};

const userPrefs = {
  devtools: {
    preferences: {
      currentDockState: '"bottom"',
      'panel-selected-tab': '"console"',
      // 'ui-theme': '"dark"',
    },
  },
};

const preferences = puppeteerPrefs as (
  config: Record<string, unknown>
) => PuppeteerExtraPlugin;

export const createBrowser = (
  overrides: Parameters<(typeof puppeteer)['launch']>[0] = {}
) => {
  puppeteer.use(preferences({ userPrefs }));
  return puppeteer.launch(Object.assign({}, launchOptions, overrides));
};
