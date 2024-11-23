import * as React from 'react';
import {
  createPolymorphicComponent,
  Stack as MantineStack,
  useProps,
  type StackProps,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';

interface Props extends StackProps {
  readonly children?: React.ReactNode;
  readonly getStyle?: () => React.CSSProperties;
  readonly render?: () => React.ReactNode;
}

const defaultProps = {
  getStyle: () => ({}),
} satisfies Partial<Props>;

export const Stack = createPolymorphicComponent<'div', Props>(
  observer(
    React.forwardRef<HTMLDivElement, Props>(function Stack(props, ref) {
      const finalProps = useProps('', defaultProps, props);
      const { children, render, className, getStyle, ...rest } = finalProps;
      return (
        <MantineStack
          ref={ref}
          className={className ?? ''}
          style={getStyle()}
          {...rest}
        >
          {children}
          {render ? render() : null}
        </MantineStack>
      );
    })
  )
);
