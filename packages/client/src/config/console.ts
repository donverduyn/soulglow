if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (msg: string) => {
    // Ignore warning messages from Vue (third-party libraries)
    if (!msg.includes('[Vue warn]') && !msg.includes('[Violation]')) {
      originalWarn(msg);
    }
  };
}
