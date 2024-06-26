import MuiMenuItem from '@mui/material/MenuItem';
import { css } from '@mui/material/styles';

interface MenuItemProps<T> extends DefaultProps {
  readonly children: React.ReactElement;
  readonly key: React.Key;
  readonly value: T;
}

export const MenuItem = <T,>(props: MenuItemProps<T>) => {
  const { className, children, value, ...rest } = props;
  return (
    <MuiMenuItem
      className={className!}
      css={menuItemStyles.root}
      value={String(value)}
      {...rest}
    >
      {children}
    </MuiMenuItem>
  );
};

const menuItemStyles = {
  root: css`
    text-align: left;
  `,
};
