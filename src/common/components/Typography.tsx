import { PropsOf } from '@emotion/react';
import { styled } from '@mui/material/styles';
import MUITypography from '@mui/material/Typography';

interface Props extends DefaultProps {
  readonly children: string;
  readonly variant?: PropsOf<typeof MUITypography>['variant'];
  readonly color?: PropsOf<typeof MUITypography>['color'];
}

const TypographyBase: React.FC<Props> = ({
  children,
  className,
  variant,
  color,
}) => {
  return (
    <MUITypography
      className={className!}
      color={color ?? 'white'}
      variant={variant ?? 'body1'}
    >
      {children}
    </MUITypography>
  );
};

export const Typography = styled(TypographyBase)(() => ({
  fontWeight: 'bold',
}));
