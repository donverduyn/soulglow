export const WithLabels =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <L extends Record<any, any>>(labels: L) =>
    <P>(Component: React.FC<P>) =>
      Object.assign(Component, { labels });
