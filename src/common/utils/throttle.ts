// const useThrottledFn = <T extends any[], U>(
//   fn: (...args: T) => U,
//   options: Partial<Parameters<typeof throttle>[1]>
// ) => {
//   const debounced = React.useRef(throttle(fn, options));
//   return debounced.current;
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const throttle = <T extends any[]>(fn: (...args: T) => void, delay: number) => {
//   let timeoutId: NodeJS.Timeout | null = null;
//   let lastArgs: T | null = null;

//   const throttledFn = (...args: T) => {
//     lastArgs = args;
//     if (!timeoutId) {
//       timeoutId = setTimeout(() => {
//         if (lastArgs) {
//           fn(...lastArgs);
//           lastArgs = null;
//         }
//         timeoutId = null;
//       }, delay);
//     }
//   };

//   return throttledFn;
// };
