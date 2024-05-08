import { createServer } from 'http-server';
import { createBrowser } from './browser';

const server = createServer({ cache: -1, root: '.analyzer' }); // Adjust the root directory as needed
server.listen(8091, 'localhost', () => {
  console.log('Server running at http://localhost:8091/');

  const launch = async () => {
    const browser = await createBrowser({ devtools: false });
    const [firstPage] = await browser.pages();
    void firstPage.goto('http://localhost:8091');
    browser.on('disconnected', () => {
      void server.close();
      process.exit(0);
    });
  };
  void launch();
});
