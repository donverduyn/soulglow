import * as React from 'react';
import type { PropsOf } from '@emotion/react';
import { Stack as MuiStack } from '@mui/material';
import { observer } from 'mobx-react-lite';

interface Props extends PropsOf<typeof MuiStack> {
  readonly children: React.ReactNode;
  readonly getStyle?: () => React.CSSProperties;
}

const StackBase: React.FC<Props> = ({ children, getStyle, ...props }) => {
  return (
    <MuiStack
      style={getStyle ? getStyle() : {}}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </MuiStack>
  );
};

export const Stack = observer(StackBase);
