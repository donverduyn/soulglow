// import {
//   Exchange,
//   Operation,
//   OperationResult,
//   CombinedError,
// } from '@urql/core';
// import { print } from 'graphql';
// import {
//   pipe,
//   share,
//   filter,
//   mergeMap,
//   mergeAll,
//   fromPromise,
//   map,
//   buffer,
//   fromValue,
// } from 'wonka';

// // Options for the exchange.
// export type BatchExchangeOpts = {
//   abortStale?: boolean;
//   afterResponse?: (ops: Operation[], res: any[]) => void;
//   batchInterval?: number;
//   beforeSend?: (ops: Operation[]) => void;
//   debug?: boolean;
//   deduplicate?: boolean;
//   maxBatchSize?: number;
//   retryCount?: number;
//   retryDelay?: (attempt: number) => number;
//   shouldBatch?: (op: Operation) => boolean;
//   url?: string;
// };

// // Fingerprint an operation based on its core semantics.
// const fingerprint = (op: Operation): string =>
//   JSON.stringify({
//     operationName: op.key,
//     query: print(op.query),
//     variables: op.variables,
//   });

// // Inflight entry stores the promise and any resolver functions waiting for the result.
// type InflightEntry = {
//   promise: Promise<OperationResult>;
//   resolvers: Array<(result: OperationResult) => void>;
// };

// // The final exchange.
// export const BatchExchange =
//   ({
//     url,
//     batchInterval = 20,
//     maxBatchSize = 10,
//     retryCount = 2,
//     retryDelay = (n) => 100 * Math.pow(2, n), // 100ms, 200ms, 400ms...
//     shouldBatch = (op) =>
//       op.kind === 'query' &&
//       ((op.context.batch as boolean | undefined) ?? true),
//     deduplicate = true,
//     abortStale = true,
//     beforeSend,
//     afterResponse,
//     debug = false,
//   }: BatchExchangeOpts = {}): Exchange =>
//   ({ forward, client }) => {
//     // Global inflight cache to reuse identical operations.
//     const inflight = new Map<string, InflightEntry>();

//     return (ops$) => {
//       const shared$ = pipe(ops$, share);

//       // Non-batch operations are forwarded immediately.
//       const nonBatch$ = pipe(
//         shared$,
//         filter((op) => !shouldBatch(op)),
//         forward
//       );

//       // Batchable operations are buffered.
//       const batchable$ = pipe(
//         shared$,
//         filter((op) => shouldBatch(op)),
//         buffer(fromValue(batchInterval)),
//         filter((ops) => ops.length > 0),
//         mergeMap((ops) => {
//           // Sort operations by optional priority.
//           ops.sort(
//             (a, b) => (a.context.priority ?? 0) - (b.context.priority ?? 0)
//           );

//           // Chunk into groups if more than maxBatchSize.
//           const opGroups: Operation[][] = [];
//           for (let i = 0; i < ops.length; i += maxBatchSize) {
//             opGroups.push(ops.slice(i, i + maxBatchSize));
//           }

//           // Process each batch group.
//           return fromPromise(
//             Promise.all(
//               opGroups.map(async (batch) => {
//                 // We'll build a list of promises (one per op) that eventually resolve to OperationResult.
//                 const opPromises: Promise<OperationResult>[] = [];
//                 // For new (non-inflight) ops, collect them for a single network call.
//                 const seen = new Set<string>();
//                 const newOpsList: Operation[] = [];

//                 // For each op, check the fingerprint and either reuse an inflight promise or create a new one.
//                 for (const op of batch) {
//                   const fp = fingerprint(op);
//                   if (deduplicate) {
//                     if (inflight.has(fp)) {
//                       // Reuse the existing promise.
//                       opPromises.push(inflight.get(fp)!.promise);
//                     } else {
//                       // Create a new promise and store it.
//                       let resolveFn: (result: OperationResult) => void;
//                       const promise = new Promise<OperationResult>(
//                         (resolve) => {
//                           resolveFn = resolve;
//                         }
//                       );
//                       inflight.set(fp, { promise, resolvers: [resolveFn!] });
//                       opPromises.push(promise);
//                       // Only add one instance per unique fingerprint for the network call.
//                       if (!seen.has(fp)) {
//                         seen.add(fp);
//                         newOpsList.push(op);
//                       }
//                     }
//                   } else {
//                     // Without deduplication, every op gets its own promise.
//                     let resolveFn: (result: OperationResult) => void;
//                     const promise = new Promise<OperationResult>((resolve) => {
//                       resolveFn = resolve;
//                     });
//                     opPromises.push(promise);
//                     newOpsList.push(op);
//                   }
//                 }

//                 // If there are new operations (i.e. not already inflight), perform the network call.
//                 if (newOpsList.length > 0) {
//                   if (beforeSend) beforeSend(newOpsList);
//                   if (debug)
//                     console.log(
//                       `[Batch] Dispatching ${String(newOpsList.length)} new ops`
//                     );

//                   const controller = new AbortController();
//                   const headers = {
//                     'Content-Type': 'application/json',
//                     ...(typeof client.fetchOptions === 'function'
//                       ? await client.fetchOptions()
//                       : client.fetchOptions?.headers),
//                   };

//                   // Build the batched request body.
//                   const body = newOpsList.map((op) => ({
//                     extensions: op.extensions,
//                     operationName: op.key,
//                     query: op.query.loc?.source.body,
//                     variables: op.variables,
//                   }));

//                   const requestUrl = url || client.url;
//                   const start = performance.now();

//                   // Retry loop for the network call.
//                   let attempt = 0;
//                   let json: any[] | null = null;
//                   while (attempt <= retryCount) {
//                     try {
//                       const res = await fetch(requestUrl, {
//                         body: JSON.stringify(body),
//                         headers,
//                         method: 'POST',
//                         signal: abortStale ? controller.signal : undefined,
//                       });
//                       json = await res.json();
//                       if (!Array.isArray(json))
//                         throw new Error('Expected batched response array');
//                       if (afterResponse) afterResponse(newOpsList, json);
//                       break;
//                     } catch (err) {
//                       if (abortStale && controller.signal.aborted) {
//                         if (debug) console.warn('[Batch] Aborted');
//                         break;
//                       }
//                       attempt++;
//                       if (attempt > retryCount) {
//                         if (debug)
//                           console.error('[Batch] Failed after retries', err);
//                         json = null;
//                         break;
//                       }
//                       await new Promise((r) =>
//                         setTimeout(r, retryDelay(attempt))
//                       );
//                     }
//                   }
//                   const end = performance.now();
//                   if (debug)
//                     console.log(
//                       `[Batch] Response in ${String(end - start)}ms for ${String(newOpsList.length)} ops`
//                     );

//                   // For each new op, resolve its promise.
//                   newOpsList.forEach((op, i) => {
//                     const fp = fingerprint(op);
//                     const res = json?.[i];
//                     const err = res?.errors
//                       ? new CombinedError({ graphQLErrors: res.errors })
//                       : undefined;
//                     const result: OperationResult = {
//                       data: res?.data ?? null,
//                       error: err,
//                       extensions: undefined,
//                       hasNext: false,
//                       operation: op,
//                     };
//                     const entry = inflight.get(fp);
//                     if (entry) {
//                       entry.resolvers.forEach((resolve) => resolve(result));
//                       inflight.delete(fp);
//                     }
//                   });
//                 }
//                 // Wait for all promises (both new and reused) to resolve.
//                 return Promise.all(opPromises);
//               })
//             )
//           ); //.then((results) => results.flat());
//         }),
//         map((results) => results.flat())
//       );

//       return mergeAll([nonBatch$, batchable$]);
//     };
//   };
