import { setupServer } from 'msw/node';
import { createTRPCMsw } from 'msw-trpc';
import { AppRouter } from 'server/server';

export const createMockServer = (
  baseUrl: string,
  getHandlers: (
    trpcMsw: ReturnType<typeof createTRPCMsw<AppRouter>>
  ) => Parameters<typeof setupServer>
) => {
  const trpcMsw = createTRPCMsw<AppRouter>({ baseUrl });
  return setupServer(...getHandlers(trpcMsw));
};
