import { renderHook } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AppRouter } from 'server/server';
import { createMockServer } from 'tests/utils/mock-server';
import { useTRPC } from './useTRPC';

describe('tRPC client', () => {
  const port = Math.round(Math.random() * 100) + 64000;
  const url = `http://localhost:${port.toString()}`;
  const user = { id: '42', name: 'Alice' };

  const server = createMockServer<AppRouter>(url, (trpcMsw) => [
    trpcMsw.userById.query((req, res, ctx) => {
      const [id] = Object.values(req.getInput());
      return res(ctx.status(200), ctx.data(id === user.id ? user : undefined));
    }),
  ]);

  beforeAll(() => server.listen());
  // afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should be able to resolve a query', async () => {
    expect.hasAssertions();

    const { result } = renderHook(() => useTRPC({ url }));
    const client = result.current;

    const response = await client.userById.query(user.id);
    expect(response?.name).toBe(user.name);
  });
});

export const foo = 'bar';
