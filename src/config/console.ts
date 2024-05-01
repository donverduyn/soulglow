if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (msg: string) => {
    // Ignore warning messages from Vue (third-party libraries)
    if (!msg.includes('[Vue warn]')) {
      originalWarn(msg);
    }
  };

  // const originalLog = console.log;
  // console.log = <T extends unknown[]>(...args: T) => {
  //   const newArgs = args.map((arg) => (isPlainObject(arg) ? freeze(arg) : arg));

  //   // Retrieve the call stack and find the caller
  //   const stack = new Error().stack || '';
  //   const stackLines = stack.split('\n');
  //   // Adjust the index 2 or 3 based on where the relevant line appears
  //   const callerLine = stackLines
  //     // .reverse()
  //     .find((line) => {
  //       const caller = line.trim().split(' ')[1];
  //       return caller ? caller.startsWith('http://localhost:4173') : null;
  //     })
  //     ?.split('at')[1];

  //   // Include original call location in the log
  //   if (callerLine) {
  //     // newArgs.unshift('font-weight: bold; font-size: 0.75em;');
  //     // newArgs.unshift(`%cFrom: ${callerLine}\n`);
  //   }

  //   // Call the original console.log with the correct context
  //   originalLog.apply(console, [
  //     'http://localhost:4173' + stackLines
  //       .map(
  //         (line) =>
  //           line.trim().split('at ')[1]?.split('http://localhost:4173')[1]?.split(')')[0]
  //       )
  //       .slice(2).filter((line) => line?.startsWith('/src')).reverse()[0]
  //   , ...newArgs]);
  // };
}
