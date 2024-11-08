// import { css } from '@emotion/react';
import { Text as MantineText, type TextProps } from '@mantine/core';

interface Props extends TextProps {
  readonly children: string;
}

export const Text: React.FC<Props> = ({
  className,
  children,
  variant,
  ...rest
}) => {
  return (
    <MantineText
      className={className!}
      // css={styles.root}
      variant={variant ?? 'body1'}
      {...rest}
    >
      {children}
    </MantineText>
  );
};

// const styles = {
//   root: css``,
// };
