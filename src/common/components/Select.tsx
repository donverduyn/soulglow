import { useState } from 'react';
import * as React from 'react';
// import { css } from '@emotion/react';
import { Combobox, Input, InputBase, useCombobox } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useReaction } from 'common/hooks/useMobx';
import { prefix } from 'config/constants';

type Item<TValue> = { id: string; label: string; value: TValue };

interface Props<TValue extends string> extends DefaultProps {
  readonly getValue: () => TValue;
  readonly items: Item<TValue>[];
  readonly label: string;
  readonly name: string;
  readonly onChange: (value: TValue) => void;
}

export const Select = observer(function Select<TValue extends string>(
  props: Props<TValue>
) {
  const { className, label, getValue, onChange, items } = props;
  const [optimistic, setOptimistic] = useState<string | null>(getValue);

  const rightSection = React.useMemo(() => <Combobox.Chevron />, []);
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  useReaction(getValue, (value) => {
    if (value !== optimistic) setOptimistic(value);
  });

  const handleClick = React.useCallback(() => {
    combobox.toggleDropdown();
  }, [combobox]);

  const handleSubmit = React.useCallback(
    (val: string) => {
      setOptimistic(val);
      onChange(val as TValue);
      combobox.closeDropdown();
    },
    [combobox, onChange]
  );

  return (
    <Combobox
      offset={0}
      onOptionSubmit={handleSubmit}
      store={combobox}
      withinPortal={false}
    >
      <Combobox.Target>
        <InputBase
          pointer
          className={className ?? ''}
          component='button'
          // css={styles.root}
          label={label}
          onClick={handleClick}
          rightSection={rightSection}
          rightSectionPointerEvents='none'
          size='md'
          type='button'
          //   variant='filled'
        >
          {optimistic ?? <Input.Placeholder>Pick value</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown 
        // css={styles.dropdown}
      >
        <Combobox.Options>{items.map(renderOption)}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
});

const renderOption = (item: Item<string>) => {
  return (
    <Combobox.Option
      key={item.id}
      value={item.value}
    >
      {item.label}
    </Combobox.Option>
  );
};

// const styles = {
//   dropdown: css`
//     border-color: light-dark(
//       var(--mantine-color-gray-4),
//       var(--mantine-color-dark-4)
//     );
//     border-top: 0;
//     border-top-left-radius: 0;
//     border-top-right-radius: 0;
//   `,
//   root: css`
//     /* --input-padding-y: 1.33rem; */
//     .${prefix}-InputBase-input {
//       align-items: center;
//       border-width: 3px;
//       display: flex;
//     }

//     .${prefix}-InputBase-label {
//       color: var(--mantine-color-white);
//       font-size: var(--mantine-font-size-sm);
//       font-variant: small-caps;
//       text-transform: lowercase;
//     }

//     &[data-expanded] {
//       border-bottom-left-radius: 0;
//       border-bottom-right-radius: 0;
//     }
//   `,
// };
