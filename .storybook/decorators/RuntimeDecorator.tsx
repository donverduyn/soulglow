import * as React from 'react';
import type { Decorator } from '@storybook/react';
import moize from 'moize';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { createRuntimeContext } from 'common/utils/context';

// TODO: think about the right place to couple the WithRuntime HOC to the storybook specific implementations.

export const RuntimeDecorator = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends ReturnType<typeof createRuntimeContext<any>>,
>(
  runtime: R
): Decorator =>
  // eslint-disable-next-line react/function-component-definition
  function RuntimeDecorator(Story) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const enhance = React.useCallback(moize(WithRuntime(runtime)), []);
    const Component = enhance(Story);
    return <Component />;
  };
