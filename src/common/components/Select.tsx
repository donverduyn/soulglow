import React, { ForwardedRef } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MUISelect,
  MenuItem,
  SelectChangeEvent,
  Typography,
  styled,
} from '@mui/material';
import { observer } from 'mobx-react-lite';

type Item<TValue> = { label: string; value: TValue };

interface SelectProps<TValue> extends DefaultProps {
  readonly items: Item<TValue>[];
  readonly getValue: () => TValue;
  readonly onChange: (value: TValue) => void;
  readonly renderItem?: (item: Item<TValue>) => React.ReactNode;
  readonly id?: string;
  readonly name?: string;
}

const SelectBase = observer(
  <TValue,>({
    className,
    getValue,
    onChange,
    items,
    // id = 'select',
    // name = 'Select',
    renderItem = renderMenuItem,
  }: SelectProps<TValue>) => {
    //
    const handleChange = React.useCallback<
      (event: SelectChangeEvent<TValue>) => void
    >((e) => onChange(e.target.value as TValue), [onChange]);

    return (
      <FormControl
        sx={{ m: 1, minWidth: 120 }}
        variant='filled'
      >
        <InputLabel id='demo-simple-select-helper-label'>Age</InputLabel>
        <MUISelect
          className={className!}
          id='demo-simple-select-helper'
          value={getValue()}
          onChange={handleChange}
        >
          {items.map((item) => renderItem(item))}
        </MUISelect>
      </FormControl>
    );
  }
);

export const Select = styled(SelectBase)`
  text-align: left;
` as typeof SelectBase;

interface SelectItemProps<TValue> extends DefaultProps {
  readonly getLabel: () => string;
  readonly getValue: () => TValue;
  readonly value: string;
}

const renderMenuItem = <T,>(item: Item<T>) => {
  return (
    <MenuItem
      key={String(item.value)}
      value={String(item.value)}
    >
      <Typography>{String(item.label)}</Typography>
    </MenuItem>
  );
};

const SelectItemBase = React.forwardRef(
  <T,>(
    { getLabel, getValue, value }: SelectItemProps<T>,
    ref: ForwardedRef<null>
  ) => {
    return (
      <MenuItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        key={String(getValue())}
        ref={ref}
        value={value}
      >
        {getLabel()}
      </MenuItem>
    );
  }
);

SelectItemBase.displayName = 'MenuItemBase';

const renderItemDefault = <T,>(item: Item<T>) => (
  <SelectItemBase
    getLabel={() => item.label}
    getValue={() => item.value}
    value={String(item.value)}
  />
);
