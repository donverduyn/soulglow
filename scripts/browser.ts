import { execSync } from 'child_process';
import { createServer } from 'http-server';
import { Browser, Page } from 'puppeteer';
import puppeteer, { PuppeteerExtraPlugin } from 'puppeteer-extra';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error no @types package
import puppeteerPrefs from 'puppeteer-extra-plugin-user-preferences';

const safeExecSync = (command: string) => {
  try {
    return execSync(command);
  } catch (error) {
    return null;
  }
};

// this only works on linux inside the dev container for now
// because we bind mount /dev/snd and rely on alsa-utils
const getAlsaOutputDevice = (): string => {
  const command = 'aplay -l';
  const list = safeExecSync(command);
  const result = list
    ? list
        .toString()
        .split('\n')
        .filter((line) => line.startsWith('card'))[0]
        .split(',')
        .map((line) => line.split(':')[0])
        .map((line) => line.split(' ').reverse()[0])
        .join(',')
    : '0,0';
  return `hw:${result}`;
};

const options: Parameters<(typeof puppeteer)['launch']>[0] = {
  args: [
    `--alsa-output-device=${getAlsaOutputDevice()}`,
    '--disable-gpu',
    '--disable-dev-shm-usage',
    // '--disable-extensions-except=/tmp/react-devtools-extensions/unpacked',
    // '--load-extension=/tmp/react-devtools-extensions/unpacked',
    '--remote-debugging-port=9222',
    // '--auto-accept-camera-and-microphone-capture',
    '--force-dark-mode',
  ],
  defaultViewport: { height: 0, width: 0 },
  devtools: true,
  // executablePath: puppeteer.executablePath(),
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

export const createBrowser = async (
  overrides: Parameters<(typeof puppeteer)['launch']>[0] = {},
  operateFn: (page: Page, browser: Browser) => Promise<void>
) => {
  puppeteer.use(preferences({ userPrefs }));
  const browser = await puppeteer.launch(Object.assign({}, options, overrides));
  const [page] = await browser.pages();

  await operateFn(page, browser);
  await page.bringToFront();
  await page.exposeFunction('closeBrowser', () => {
    void browser.close();
  });

  await page.evaluateHandle(() => {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error closeBrowser is created above
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        void window.closeBrowser();
      }
    });
  });
  return browser;
};

export const viewStatic = (
  dir: string = './dist',
  address: string = '127.0.0.1',
  port: number = 8080
) => {
  const server = createServer({ cache: -1, root: dir });
  server.listen(port, address, () => {
    void createBrowser({ devtools: false }, async (page, browser) => {
      await page.goto(`http://${address}:${port.toString()}`);
      browser.on('disconnected', server.close.bind(server));
    });
  });
};
