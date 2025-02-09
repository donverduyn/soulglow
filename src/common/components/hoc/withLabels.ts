// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WithLabels<L extends Record<any, any>, C extends React.FC<any>>(
  labels: L
): (Component?: C) => C & { labels: L };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WithLabels<L extends Record<any, any>>(labels: L) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <C extends React.FC<any>>(Component?: C) =>
    Object.assign(Component ?? {}, { labels });
}
