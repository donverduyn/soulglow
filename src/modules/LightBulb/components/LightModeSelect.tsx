import React from 'react';
// import type { Faker } from '@faker-js/faker';
import { styled } from '@mui/material/styles';
import { observable } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { v4 as uuid } from 'uuid';
import { MenuItem } from 'common/components/MenuItem';
import { Select } from 'common/components/Select';

// let faker: Faker | null = null;
// if (process.env.NODE_ENV === 'development') {
//   void import('@faker-js/faker/locale/nl').then((mod2) => {
//     faker = mod2.faker;
//   });
// }

export enum LightMode {
  COLOR = 'color',
  WHITE = 'white',
}

const MODE_ITEMS = observable.array([
  { id: uuid(), label: 'Color', value: LightMode.COLOR },
  { id: uuid(), label: 'White', value: LightMode.WHITE },
]);

interface Props extends DefaultProps {
  readonly getValue: () => LightMode;
  readonly onChange: (value: LightMode) => void;
}

const LightModeSelectBase: React.FC<Props> = ({ getValue, onChange }) => {
  return (
    <Select
      getValue={getValue}
      items={MODE_ITEMS}
      label='Mode'
      onChange={onChange}
      renderItem={(item) => (
        <MenuItem
          key={item.id}
          value={item.value}
        >
          <Observer render={() => <span>{item.label}</span>} />
        </MenuItem>
      )}
    />
  );
};

export const LightModeSelect = styled(LightModeSelectBase)({});
