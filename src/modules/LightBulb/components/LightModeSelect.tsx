import React from 'react';
// import type { Faker } from '@faker-js/faker';
import { styled } from '@mui/material/styles';
import { Observer } from 'mobx-react-lite';
import { MenuItem } from 'common/components/MenuItem';
import { Select } from 'common/components/Select';
import { LightMode, MODE_ITEMS } from './constants';

// let faker: Faker | null = null;
// if (process.env.NODE_ENV === 'development') {
//   void import('@faker-js/faker/locale/nl').then((mod2) => {
//     faker = mod2.faker;
//   });
// }

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
