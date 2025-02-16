/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import * as React from 'react';
import {
  DocsContext,
  SourceContext,
  useSourceProps,
  Canvas as SbCanvas,
} from '@storybook/blocks';
import { useAwaitable } from './../hooks/useAwaitable';

const CustomCanvas = (OriginalCanvas: typeof SbCanvas) => {
  // eslint-disable-next-line react/function-component-definition
  return function Canvas(props: React.ComponentProps<typeof SbCanvas>) {
    const sourceContext = React.useContext(SourceContext);
    const docsContext = React.useContext(DocsContext);
    const { of, source } = props;
    const sourceProps = useSourceProps(
      { ...source, ...(of && { of }) },
      docsContext,
      sourceContext
    );

    const awaitableCode = sourceProps.code as Promise<string> | string;
    const code = useAwaitable(awaitableCode);
    const patchedSource = React.useMemo(
      () => Object.assign({}, source, { code }),
      [source, code]
    );

    return code === null ? (
      'loading...'
    ) : (
      <OriginalCanvas
        {...props}
        source={patchedSource}
      />
    );
  };
};

export const Canvas = CustomCanvas(SbCanvas);
