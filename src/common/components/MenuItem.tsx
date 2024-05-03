import MUIMenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

interface MenuItemProps<T> extends DefaultProps {
  readonly children: React.ReactElement;
  readonly value: T;
  readonly key: React.Key;
}

const MenuItemBase = <T,>(props: MenuItemProps<T>) => {
  const { children, value, ...rest } = props;
  return (
    <MUIMenuItem
      value={String(value)}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      {children}
    </MUIMenuItem>
  );
};

export const MenuItem = styled(MenuItemBase)({
  textAlign: 'left',
}) as typeof MenuItemBase;
