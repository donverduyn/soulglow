import { createServer } from 'http-server';
import { createBrowser } from '../test/launch';

const server = createServer({ cache: -1, root: '.analyzer' }); // Adjust the root directory as needed
server.listen(8091, 'localhost', () => {
  console.log('Server running at http://localhost:8091/');

  const launch = async () => {
    const browser = await createBrowser();
    const [firstPage] = await browser.pages();
    void firstPage.goto('http://localhost:8091');
  };
  void launch();
});
