import * as React from 'react';
import * as Storybook from '_storybook/utils/decorator';
import { withRuntime } from 'common/components/hoc/withRuntime';
import { createRuntimeContext } from 'common/utils/context';

// TODO: think about the right place to couple the WithRuntime HOC to the storybook specific implementations.

export const RuntimeDecorator = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends ReturnType<typeof createRuntimeContext<any>>,
>(
  runtime: R
) => {
  const Enhanced = withRuntime(runtime)();
  return Storybook.createDecorator((Story) => (
    <Enhanced>
      <Story />
    </Enhanced>
  ));
};
