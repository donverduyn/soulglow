import * as React from 'react';
import MuiButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
}

const ButtonBase: React.FC<Props> = ({ children, className }) => {
  return (
    <MuiButton
      className={className!}
      variant='contained'
    >
      {children}
    </MuiButton>
  );
};

export const Button = styled(ButtonBase)`
  background: red;
`;
