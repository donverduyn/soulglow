import MuiMenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

interface MenuItemProps<T> extends DefaultProps {
  readonly children: React.ReactElement;
  readonly key: React.Key;
  readonly value: T;
}

const MenuItemBase = <T,>(props: MenuItemProps<T>) => {
  const { children, value, ...rest } = props;
  return (
    <MuiMenuItem
      value={String(value)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </MuiMenuItem>
  );
};

export const MenuItem = styled(MenuItemBase)({
  textAlign: 'left',
}) as typeof MenuItemBase;
