import { execSync } from 'child_process';
import puppeteer, { PuppeteerExtraPlugin } from 'puppeteer-extra';
import puppeteerPrefs from 'puppeteer-extra-plugin-user-preferences';

export const getAlsaOutputDevice = (): string => {
  // Run aplay -l and extract the card and device number for hw:0,3
  const device: string = execSync(
    "aplay -l | awk '/card 0: HDMI.*device 3: HDMI 3/ {print $2}' | tr -d '[:]'"
  )
    .toString()
    .trim();
  let card_number: string = device.split(':')[1];
  let device_number: string = device.split(':')[2];

  // If device is empty, default to hw:0,3
  if (!device) {
    card_number = '0';
    device_number = '3';
  }

  return `hw:${card_number},${device_number}`;
};

const preferences = puppeteerPrefs as (
  config: Record<string, unknown>
) => PuppeteerExtraPlugin;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func<T> = (...args: any[]) => T;

export function asyncMemoize<T>(func: Func<Promise<T>>): Func<Promise<T>> {
  const cache: Map<string, T> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (...args: any[]): Promise<T> => {
    const key: string = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result: T = await func(...args);
    cache.set(key, result);
    return result;
  };
}

export const createBrowser = asyncMemoize(() => {
  puppeteer.use(
    preferences({
      userPrefs: {
        browser: {},
        devtools: {
          preferences: {
            currentDockState: '"bottom"',
            'panel-selected-tab': '"console"',
            // 'ui-theme': '"dark"',
          },
        },
        profile: {
          default_content_setting_values: {
            fonts: 1,
          },
        },
        settings: {
          clock: { use_24hour_clock: true },
          first_run_tutorial_shown: true,
          timezone: 'timezoneid',
        },
        webkit: {
          webprefs: {
            default_fixed_font_size: 13,
            default_font_size: 16,
            default_monospace_font_size: 13,
            fonts: {
              // cursive: { Zyyy: "'Liberation Mono'" },
              // fantasy: { Zyyy: "'Liberation Mono'" },
              // fixed: { Zyyy: "'Liberation Mono'" },
              // pictograph: { Zyyy: "'Liberation Mono'" },
              // sansserif: { Zyyy: "'Liberation Mono'" },
              // serif: { Zyyy: "'Liberation Mono'" },
              standard: "'FreeMono'",
            },
            minimum_font_size: 12,
            minimum_logical_font_size: 9,
          },
        },
      },
    })
  );

  // Launch the browser and open a new blank page
  const browser = puppeteer.launch({
    args: [
      `--alsa-output-device=${getAlsaOutputDevice()}`,
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-first-run-ui',
      '--no-first-run',
      '--bwsi',
      // '--force-dark-mode',
      '--disable-extensions-except=/tmp/react-devtools-extensions/unpacked',
      '--load-extension=/tmp/react-devtools-extensions/unpacked',
    ],
    defaultViewport: { height: 0, width: 0 },
    devtools: true,
    // dumpio: true,
    executablePath: puppeteer.executablePath(),
    headless: false,
  });

  return browser;
});

export const launch = async (url: string) => {
  const browser = await createBrowser('foo');

  // const pages = await browser.pages(); // Get all open pages
  // const page = pages[0]; // Use the first page
  // await page.goto('http://localhost:4173'); // Navigate to the page
  const page = await browser.newPage();
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  // Navigate the page to a URL
  await page.goto(url);

  // Set screen size
  // await page.setViewport({ height: 1024, width: 1080 });

  // Type into search box
  // await page.type('.devsite-search-field', 'automate beyond recorder');

  // Wait and click on first result
  // const searchResultSelector = '.devsite-result-item-link';
  // await page.waitForSelector(searchResultSelector);
  // await page.click(searchResultSelector);

  // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector(
  //   'text/Customize and automate'
  // );
  // const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle);

  // await browser.close();
};
