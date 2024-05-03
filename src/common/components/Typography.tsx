import { PropsOf } from '@emotion/react';
import { styled } from '@mui/material/styles';
import MuiTypography from '@mui/material/Typography';

interface Props extends DefaultProps {
  readonly children: string;
  readonly color?: PropsOf<typeof MuiTypography>['color'];
  readonly variant?: PropsOf<typeof MuiTypography>['variant'];
}

const TypographyBase: React.FC<Props> = ({
  children,
  className,
  variant,
  color,
}) => {
  return (
    <MuiTypography
      className={className!}
      color={color ?? 'white'}
      variant={variant ?? 'body1'}
    >
      {children}
    </MuiTypography>
  );
};

export const Typography = styled(TypographyBase)(() => ({
  fontWeight: 'bold',
}));
