import { css } from '@emotion/react';
import {
  Paper as MantinePaper,
  PaperProps,
  ElementProps,
  type MantineTheme,
  useMantineTheme,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';

interface Props extends PaperProps, ElementProps<'div', keyof PaperProps> {
  readonly getStyle?: (theme: MantineTheme) => React.CSSProperties;
  readonly render?: () => React.ReactNode;
}

export const Paper: React.FC<Props> = observer(function Paper(props) {
  const { children, className, getStyle, render, ...rest } = props;
  const theme = useMantineTheme();
  return (
    <MantinePaper
      className={className ?? ''}
      // css={styles.root}
      style={getStyle ? getStyle(theme) : undefined}
      {...rest}
    >
      {render ? render() : children}
    </MantinePaper>
  );
});

// const styles = {
//   root: css``,
// };
