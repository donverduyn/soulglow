import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MUISelect from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import { observable, runInAction, untracked } from 'mobx';
import { Observer, observer } from 'mobx-react-lite';
import { isFunction } from 'remeda';
import { useMobx } from 'common/hooks/useMobx';

type Item<TValue> = { id: string; label: string; value: TValue };

type FnOrValue<T> = T | (() => T);

const unwrap = <T,>(fnOrValue: FnOrValue<T>) =>
  isFunction(fnOrValue) ? fnOrValue() : fnOrValue;

interface SelectProps<TValue> extends DefaultProps {
  readonly value: (() => TValue) | TValue;
  readonly items: Item<TValue>[];
  readonly onChange: (value: TValue) => void;
  readonly renderItem?: (item: Item<TValue>) => React.ReactNode;
  // readonly id?: string;
  // readonly name?: string;
}

const SelectBase = <TValue,>({
  className,
  value,
  onChange,
  items,
  // id = 'select',
  // name = 'Select',
  renderItem = renderMenuItem,
}: SelectProps<TValue>) => {
  //
  console.log('SelectBase', Date.now());

  const handleChange = React.useCallback<
    (event: SelectChangeEvent<TValue>) => void
  >((e) => onChange(e.target.value as TValue), [onChange]);

  return (
    <FormControl
      sx={{ m: 1, minWidth: 120 }}
      variant='filled'
    >
      <InputLabel id='bulb-mode'>Mode</InputLabel>
      <MUISelect
        className={className!}
        // maybe we can support both controlled and uncontrolled for perf?
        defaultValue={untracked(() => unwrap(value))}
        id='bulb-mode'
        onChange={handleChange}
      >
        {items.map(
          (item) => renderItem(item)
          // return (
          //   <StyledMenuItem
          //     key={item.id}
          //     value={item.value}
          //   >
          //     <Observer>{() => <span>{item.label}</span>}</Observer>
          //   </StyledMenuItem>
          // );
        )}
      </MUISelect>
    </FormControl>
  );
};

export const Select = styled(observer(SelectBase))`
  text-align: left;
` as typeof SelectBase;

// this is what MUI Select provides

interface SelectItemProps<TValue> extends DefaultProps {
  readonly value: TValue;
  readonly children?: React.ReactNode;
}

// eslint-disable-next-line react/display-name
const renderMenuItem = <T,>(item: Item<T>) => {
  return (
    <MenuItem
      key={item.id}
      // eslint-disable-next-line react/jsx-props-no-spreading
      value={String(item.value)}
    >
      <Observer render={() => <span>{item.label}</span>} />
    </MenuItem>
  );
};

// eslint-disable-next-line react/display-name
const RenderItem = observer(
  <T,>({ value, children, ...rest }: SelectItemProps<T>) => {
    return (
      <MenuItem
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
        value={String(value)}
      >
        {children}
      </MenuItem>
    );
  }
);

const StyledMenuItem = styled(RenderItem)`
  font-weight: bold;
`;

const items = observable.array([
  { id: '1', label: 'One', value: 1 },
  { id: '2', label: 'Two', value: 2 },
  { id: '3', label: 'Three', value: 3 },
]);

// eslint-disable-next-line react/no-multi-comp
export const TestComponent = () => {
  const state = useMobx(() => ({ value: 1 }));

  React.useEffect(() => {
    const interval = setInterval(() => {
      runInAction(() => {
        items[0].label = Date.now().toString();
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Select
      items={items}
      value={() => state.value}
      renderItem={(item) => (
        <StyledMenuItem
          key={item.id}
          value={item.value}
        >
          <Observer render={() => <span>{item.label}</span>} />
        </StyledMenuItem>
      )}
      onChange={(value) => runInAction(() => (state.value = value))}
    />
  );
};
