import * as React from 'react';
import { css } from '@emotion/react';
import { Button as MantineButton, type ButtonProps } from '@mantine/core';
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
export const Button: React.FC<Props> = ({
  className,
  children,
  onClick,
  ...rest
}) => {
  return (
    <MantineButton
      className={className!}
      onClick={onClick}
      size='md'
      styles={styles}
      variant='filled'
      {...rest}
    >
      {children}
    </MantineButton>
  );
};

const styles = {
  label: css`
    /* background: red !important; */
  `,
};
