import { copyStaticProperties } from 'common/utils/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WithStatic<T extends Record<any, any>>(staticProperties: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <C extends React.FC<any>>(Component: C) => {
    copyStaticProperties(
      staticProperties,
      Component as Record<string, unknown>
    );
    return Component as C & T;
  };
}
