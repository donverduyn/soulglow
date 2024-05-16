import * as React from 'react';
import MuiButton from '@mui/material/Button';
import { css } from '@mui/material/styles';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
}

export const Button: React.FC<Props> = ({ className, children }) => {
  return (
    <MuiButton
      className={className!}
      css={buttonStyles.root}
      variant='contained'
    >
      {children}
    </MuiButton>
  );
};

const buttonStyles = {
  root: css`
    background: red;
  `,
};
