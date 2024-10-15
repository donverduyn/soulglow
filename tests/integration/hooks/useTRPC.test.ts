import { renderHook } from '@testing-library/react';
import { useTRPC } from 'common/hooks/useTRPC';
import type { AppRouter } from 'server/server';
import { createMockServer } from 'tests/utils/mock-server';

describe('tRPC client', () => {
  const port = Math.round(Math.random() * 100) + 62000;
  const url = `http://localhost:${port.toString()}`;
  const user = { id: '42', name: 'Alice' };

  const server = createMockServer<AppRouter>(url, (trpcMsw) => [
    trpcMsw.userById.query((input) =>
      input[0] === user.id ? user : undefined
    ),
  ]);

  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should be able to resolve a query', async () => {
    expect.assertions(1);

    const { result } = renderHook(() => useTRPC({ url }));
    const client = result.current;

    const response = await client.userById.query(user.id);
    expect(response?.name).toBe(user.name);
  });
});
