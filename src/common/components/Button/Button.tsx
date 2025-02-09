import * as React from 'react';
import { Button as MantineButton, type ButtonProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';
interface Props extends ButtonProps {
  readonly onClick?: () => void;
}

/**
 * This is the canonical button component for the application.
 * The public API supports both variants and different sizes,
 * as well as disabled and other states.
 * Only Variants Light and Variants Dark have fixed themes.
 * Use storybook theme to visualize the others.
 */
export const Button: React.FC<Props> = observer(function Button({
  className,
  children,
  onClick,
  ...rest
}) {
  return (
    <MantineButton
      // unstyled
      className={className!}
      onClick={onClick}
      size='md'
      variant='filled'
      {...rest}
    >
      {children}
    </MantineButton>
  );
});
