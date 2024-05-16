import * as React from 'react';
import type { PropsOf } from '@emotion/react';
import { Stack as MuiStack } from '@mui/material';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
  readonly getStyle?: () => React.CSSProperties;
  readonly style?: React.CSSProperties;
  readonly sx?: PropsOf<typeof MuiStack>['sx'];
}

export const Stack: React.FC<Props> = observer(
  ({ children, className, sx, style = {}, getStyle }) => {
    const styles = getStyle ? Object.assign(style, getStyle()) : style;
    return (
      <MuiStack
        className={className!}
        style={styles}
        sx={sx!}
      >
        {children}
      </MuiStack>
    );
  }
);
