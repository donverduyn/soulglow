import * as React from 'react';
import type { PropsOf } from '@emotion/react';
import { Stack as MuiStack } from '@mui/material';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly children?: React.ReactNode;
  readonly getStyle?: () => React.CSSProperties;
  readonly render?: () => React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly sx?: PropsOf<typeof MuiStack>['sx'];
}

export const Stack: React.FC<Props> = observer(
  ({ children, render, className, style = {}, getStyle }) => {
    const styles = getStyle ? Object.assign(style, getStyle()) : style;
    return (
      <div
        className={className}
        style={styles}
      >
        {children}
        {render ? render() : null}
      </div>
    );
  }
);
