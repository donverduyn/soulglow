// import { AnyRouter } from '@trpc/server';
// import { setupWorker } from 'msw/browser';
// import { createTRPCMsw } from 'msw-trpc';

// export const createMockServer = <T extends AnyRouter>(
//   baseUrl: string,
//   getHandlers: (
//     trpcMsw: ReturnType<typeof createTRPCMsw<T>>
//   ) => Parameters<typeof setupWorker>
// ) => {
//   const trpcMsw = createTRPCMsw<T>({ baseUrl });
//   return setupWorker(...getHandlers(trpcMsw));
// };

// // async function enableMocking() {
// //   if (process.env.NODE_ENV !== 'development') {
// //     return
// //   }

// //   const { worker } = await import('./mocks/browser')

// //   // `worker.start()` returns a Promise that resolves
// //   // once the Service Worker is up and ready to intercept requests.
// //   return worker.start()
// // }
