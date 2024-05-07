import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { Observer, observer } from 'mobx-react-lite';
import { unwrap } from 'common/utils/unwrap';

type Item<TValue> = { id: string; label: string; value: TValue };

interface SelectProps<TValue> extends DefaultProps {
  readonly getValue: (() => TValue) | TValue;
  readonly items: Item<TValue>[];
  readonly label: string;
  readonly onChange: (value: TValue) => void;
  readonly renderItem?: (item: Item<TValue>) => React.ReactElement;
}

// type Test = Parameters<typeof SelectBase>[0];

const SelectBase = observer(<TValue,>(props: SelectProps<TValue>) => {
  const { className, label, getValue, onChange, items, renderItem } = props;
  const safeRender = renderItem ?? renderDefaultSelectItem;
  //
  const handleChange = React.useCallback<
    (event: SelectChangeEvent<TValue>) => void
  >((e) => onChange(e.target.value as TValue), [onChange]);

  // const [open, setOpen] = React.useState(false);

  return (
    <FormControl
      className={className!}
      variant='filled'
    >
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        onChange={handleChange}
        // onClose={() => setOpen(false)}
        // onOpen={() => setOpen(true)}
        value={unwrap(getValue)}
        MenuProps={{
          slotProps: {
            paper: {
              elevation: 16,
              sx: { borderTopLeftRadius: 0, borderTopRightRadius: 0 },
            },
          },
        }}
      >
        {items.map(safeRender)}
      </MuiSelect>
      {/* <Backdrop
        onClick={() => console.log('Backdrop clicked')}
        open={open}
      /> */}
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
