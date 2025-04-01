import * as React from 'react';
import {
  DocsContext,
  SourceContext,
  useSourceProps,
  type SourceProps,
  Source as SbSource,
} from '@storybook/blocks';
import { useAwaitable } from '../hooks/useAwaitable';

const CustomSource = (OriginalSource: typeof SbSource) => {
  return function Source(props: SourceProps) {
    const sourceContext = React.useContext(SourceContext);
    const docsContext = React.useContext(DocsContext);
    const sourceProps = useSourceProps(props, docsContext, sourceContext);
    const awaitableCode = sourceProps.code as Promise<string> | string;
    const code = useAwaitable(awaitableCode);

    return code === null ? (
      ''
    ) : (
      <OriginalSource
        {...props}
        code={code}
      />
    );
  };
};

export const Source = CustomSource(SbSource);
