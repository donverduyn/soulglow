import { AnyRouter } from '@trpc/server';
import { setupServer } from 'msw/node';
import { createTRPCMsw } from 'msw-trpc';

export const createMockServer = <T extends AnyRouter>(
  baseUrl: string,
  getHandlers: (
    trpcMsw: ReturnType<typeof createTRPCMsw<T>>
  ) => Parameters<typeof setupServer>
) => {
  const trpcMsw = createTRPCMsw<T>({ baseUrl });
  return setupServer(...getHandlers(trpcMsw));
};
