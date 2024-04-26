// export function throttle<T extends (...args: any[]) => any>(
//   func: T,
//   limit: number
// ): T {
//   let lastFunc: number;
//   let lastRan: number;

//   return function (...args: any[]) {
//     // @ts-expect-error ts(2683)
//     const context = this;
//     if (!lastRan) {
//       func.apply(context, args);
//       lastRan = Date.now();
//     } else {
//       clearTimeout(lastFunc);
//       lastFunc = window.setTimeout(
//         function () {
//           if (Date.now() - lastRan >= limit) {
//             func.apply(context, args);
//             lastRan = Date.now();
//           }
//         },
//         limit - (Date.now() - lastRan)
//       );
//     }
//   } as T;
// }
