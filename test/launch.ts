import puppeteer from 'puppeteer';

void (async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    args: [
      // '--disable-gpu',
      // '--disable-dev-shm-usage',
      // '--disable-setuid-sandbox',
      '--no-sandbox',
      // '--disable-dev-shm-usage',
      // '--disable-accelerated-2d-canvas',
      // '--no-first-run',
      // '--no-zygote',
      // '--single-process', // May be dangerous in production
      // '--disable-gpu',
      // '--dbus-stub',
    ],
    // devtools: true,
    // executablePath: '/opt/google/chrome',
    headless: true,
  });
  const page = await browser.newPage();
  // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  // Navigate the page to a URL
  await page.goto('https://developer.chrome.com/');

  // Set screen size
  await page.setViewport({ height: 1024, width: 1080 });

  // Type into search box
  await page.type('.devsite-search-field', 'automate beyond recorder');

  // Wait and click on first result
  const searchResultSelector = '.devsite-result-item-link';
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);

  // Locate the full title with a unique string
  const textSelector = await page.waitForSelector(
    'text/Customize and automate'
  );
  const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // Print the full title
  console.log('The title of this blog post is "%s".', fullTitle);

  await browser.close();
})();
