import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MUISelect from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { Observer, observer } from 'mobx-react-lite';
import { unwrap } from 'common/utils/unwrap';

type Item<TValue> = { id: string; label: string; value: TValue };

interface SelectProps<TValue> extends DefaultProps {
  readonly value: (() => TValue) | TValue;
  readonly items: Item<TValue>[];
  readonly onChange: (value: TValue) => void;
  readonly renderItem?: (item: Item<TValue>) => React.ReactElement;
}

const SelectBase = observer(<TValue,>(props: SelectProps<TValue>) => {
  const { className, value, onChange, items, renderItem } = props;
  const safeRender = renderItem ?? renderDefaultSelectItem;
  //
  const handleChange = React.useCallback<
    (event: SelectChangeEvent<TValue>) => void
  >((e) => onChange(e.target.value as TValue), [onChange]);

  return (
    <FormControl
      className={className!}
      sx={{ m: 1, minWidth: 120 }}
      variant='filled'
    >
      <InputLabel id='bulb-mode'>Mode</InputLabel>
      <MUISelect
        id='bulb-mode'
        onChange={handleChange}
        value={unwrap(value)}
      >
        {items.map(safeRender)}
      </MUISelect>
    </FormControl>
  );
});

const renderDefaultSelectItem = <T,>(item: Item<T>) => {
  return (
    <MenuItem
      key={item.id}
      value={String(item.value)}
    >
      <Observer render={() => <span>{item.label}</span>} />
    </MenuItem>
  );
};

export const Select = styled(SelectBase)`
  margin: 0 0 1em 0;
  text-align: left;
` as typeof SelectBase;
