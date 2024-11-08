// import { css } from '@emotion/react';
import { ActionIcon, ActionIconProps, type ElementProps } from '@mantine/core';

interface Props
  extends ActionIconProps,
    ElementProps<'button', keyof ActionIconProps> {}

export const IconButton: React.FC<Props> = (props) => {
  return (
    <ActionIcon
      // css={styles.root}
      {...props}
    />
  );
};

// const styles = {
//   root: css``,
// };
