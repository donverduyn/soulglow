import { css, PropsOf } from '@emotion/react';
import MuiTypography from '@mui/material/Typography';

interface Props extends DefaultProps {
  readonly children: string;
  readonly color?: PropsOf<typeof MuiTypography>['color'];
  readonly variant?: PropsOf<typeof MuiTypography>['variant'];
}

export const Typography: React.FC<Props> = ({
  className,
  children,
  variant,
}) => {
  return (
    <MuiTypography
      className={className!}
      css={typographyStyles.root}
      variant={variant ?? 'body1'}
    >
      {children}
    </MuiTypography>
  );
};

const typographyStyles = {
  root: css`
    color: inherit;
  `,
};
