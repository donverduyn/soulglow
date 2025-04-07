import { runQuery } from './App.runtime';

describe('should test context', () => {
  it('should test context', async () => {
    expect.hasAssertions();
    const result = await runQuery();
    expect(result).toBeDefined();
  });
  it('should be true', () => {
    expect.hasAssertions();
    expect(true).toBeTruthy();
  });
});
