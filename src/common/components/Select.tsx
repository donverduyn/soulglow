import React from 'react';
import {
  Select as MUISelect,
  MenuItem,
  SelectChangeEvent,
  styled,
} from '@mui/material';
import { untracked } from 'mobx';
import { observer } from 'mobx-react-lite';

type Item<T> = { label: string; value: T };

interface SelectProps<T> extends DefaultProps {
  readonly items: Item<T>[];
  readonly getValue: () => T;
  readonly onChange: (value: Item<T>) => void;
  readonly renderItem?: (item: Item<T>) => React.ReactNode;
}

interface MenuItemProps extends DefaultProps {
  getValue: () => string;
  getLabel: () => string;
}

const MenuItemBase = observer(({ getValue, getLabel }: MenuItemProps) => {
  return <MenuItem value={getValue()}>{getLabel()}</MenuItem>;
});

const renderItemDefault = <T,>(item: Item<T>) => (
  <MenuItemBase
    getLabel={() => item.label}
    getValue={() => String(item.value)}
  />
);

const SelectBase = observer(
  <T,>({
    className,
    getValue,
    onChange,
    items,
    renderItem = renderItemDefault,
  }: SelectProps<T>) => {
    //
    const handleChange = React.useCallback<
      (event: SelectChangeEvent<Item<T>>) => void
      // @ts-expect-error - The type of event.target.value is string
    >((e) => onChange(e.target.value), [onChange]);

    return (
      <MUISelect
        className={className!}
        defaultValue={untracked(getValue) as unknown as Item<T>}
        value={getValue()}
        onChange={handleChange}
      >
        {items.map(renderItem)}
      </MUISelect>
    );
  }
);

export const Select = styled(SelectBase)`
  /* width: 100%;
  height: 40;
  padding: 0 10px;
  border-radius: 4;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #000;
  &:focus {
    outline: none;
    border-color: #52af77;
  }
  &:hover {
    border-color: #52af77;
  } */
`;
