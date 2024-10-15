import * as React from 'react';
import { css } from '@emotion/react';
import { Button as MantineButton, type ButtonProps } from '@mantine/core';
interface Props extends ButtonProps {
  readonly onClick?: () => void;
}

export const Button: React.FC<Props> = ({
  className,
  children,
  onClick,
  ...rest
}) => {
  return (
    <MantineButton
      className={className!}
      color='gray.0'
      css={styles.root}
      onClick={onClick}
      size='md'
      variant='filled'
      {...rest}
    >
      {children}
    </MantineButton>
  );
};

const styles = {
  root: css``,
};
