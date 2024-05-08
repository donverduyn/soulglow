import { db } from './db';
import { publicProcedure, router } from './trpc';

export const appRouter = router({
  // ...
  userById: publicProcedure
    // The input is unknown at this time. A client could have sent
    // us anything so we won't assume a certain data type.
    .input((val: unknown) => {
      // If the value is of type string, return it.
      // It will now be inferred as a string.
      if (typeof val === 'string') return val;
      // Uh oh, looks like that input wasn't a string.
      // We will throw an error instead of running the procedure.
      throw new Error(`Invalid input: ${typeof val}`);
    })
    .query(async (opts) => {
      const { input } = opts;
      // Retrieve the user with the given ID
      const user = await db.user.findById(input);
      return user;
    }),
});

export type AppRouter = typeof appRouter;

// /**
//  * This a minimal tRPC server
//  */
// import { createHTTPServer } from '@trpc/server/adapters/standalone';
// import { z } from 'zod';
// import { db } from './db.js';
// import { publicProcedure, router } from './trpc.js';

// const appRouter = router({
//   user: {
//     list: publicProcedure.query(async () => {
//       // Retrieve users from a datasource, this is an imaginary database
//       const users = await db.user.findMany();
//       //    ^?
//       return users;
//     }),
//     byId: publicProcedure.input(z.string()).query(async (opts) => {
//       const { input } = opts;
//       //      ^?
//       // Retrieve the user with the given ID
//       const user = await db.user.findById(input);
//       return user;
//     }),
//     create: publicProcedure
//       .input(z.object({ name: z.string() }))
//       .mutation(async (opts) => {
//         const { input } = opts;
//         //      ^?
//         // Create a new user in the database
//         const user = await db.user.create(input);
//         //    ^?
//         return user;
//       }),
//   },
// });
