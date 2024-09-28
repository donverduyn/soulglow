import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { css } from '@mui/material/styles';
import { Observer, observer } from 'mobx-react-lite';
import moize from 'moize';
import { unwrap } from 'common/utils/unwrap';

type Item<TValue> = { id: string; label: string; value: TValue };

interface SelectProps<TValue> extends DefaultProps {
  readonly getValue: (() => TValue) | TValue;
  readonly items: Item<TValue>[];
  readonly label: string;
  readonly name: string;
  readonly onChange: (value: TValue) => void;
  readonly renderItem?: (item: Item<TValue>) => React.ReactElement;
}

export const Select = observer(function Select<TValue>(
  props: SelectProps<TValue>
) {
  const { className, label, getValue, onChange, items, renderItem, name } =
    props;

  const safeRender = renderItem ?? renderDefaultSelectItem;
  const handleChange = React.useCallback<
    (event: SelectChangeEvent<TValue>) => void
  >((e) => onChange(e.target.value as TValue), [onChange]);

  const inputProps = React.useMemo(() => ({ id: name }), [name]);
  const menuProps = React.useMemo(
    () => ({
      slotProps: {
        paper: {
          elevation: 16,
          sx: {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            transform: 'translate(0, -0.5px) !important',
          },
        },
      },
    }),
    []
  );

  return (
    <FormControl
      className={className!}
      css={selectStyles.root}
      variant='filled'
    >
      <InputLabel htmlFor={name}>{label}</InputLabel>
      <MuiSelect
        inputProps={inputProps}
        MenuProps={menuProps}
        name={name}
        onChange={handleChange}
        value={unwrap(getValue)}
      >
        {items.map(safeRender)}
      </MuiSelect>
    </FormControl>
  );
});

const selectStyles = {
  root: css`
    margin: 0 0 1em;
    text-align: left;
  `,
};

const renderDefaultSelectItem = <T,>(item: Item<T>) => {
  const render = moize(() => <span>{item.label}</span>);
  return (
    <MenuItem
      key={item.id}
      value={String(item.value)}
    >
      <Observer render={render} />
    </MenuItem>
  );
};
