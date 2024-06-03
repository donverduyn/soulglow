import * as React from 'react';
import MuiButton from '@mui/material/Button';
import { css } from '@mui/material/styles';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
}

export const Button: React.FC<Props> = ({ className, children, onClick }) => {
  return (
    <MuiButton
      className={className!}
      css={buttonStyles.root}
      onClick={onClick}
      variant='contained'
    >
      {children}
    </MuiButton>
  );
};

const buttonStyles = {
  root: css`
    /* background: red; */
  `,
};
