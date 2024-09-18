import type { PropsOf } from '@emotion/react';
import MuiIconButton from '@mui/material/IconButton';

export const IconButton = (props: PropsOf<typeof MuiIconButton>) => {
  return <MuiIconButton {...props} />;
};
