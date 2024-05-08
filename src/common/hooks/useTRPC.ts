import {
  HTTPBatchLinkOptions,
  createTRPCProxyClient,
  httpBatchLink,
} from '@trpc/client';
import { memoize } from 'common/utils/memoize';
import type { AppRouter } from 'server/server';

export const useTRPC = memoize(({ url }: HTTPBatchLinkOptions) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        headers() {
          return {
            authorization: 'TOKEN', //getAuthCookie(),
          };
        },
        url: url as string,
      }),
    ],
  })
);
