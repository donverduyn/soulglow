import type { PropsOf } from '@emotion/react';
import MuiPaper from '@mui/material/Paper';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
  readonly getStyle?: () => React.CSSProperties;
  readonly sx?: PropsOf<typeof MuiPaper>['sx'];
}

export const Paper: React.FC<Props> = observer(
  ({ sx, className, getStyle, children }) => {
    return (
      <MuiPaper
        className={className!}
        style={getStyle ? getStyle() : {}}
        sx={sx!}
      >
        {children}
      </MuiPaper>
    );
  }
);
