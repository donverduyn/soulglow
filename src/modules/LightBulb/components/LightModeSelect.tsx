import React from 'react';
import type { Faker } from '@faker-js/faker';
import { styled } from '@mui/material/styles';
import { observable, runInAction } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { useInterval } from 'react-use';
import { v4 as uuid } from 'uuid';
import { MenuItem } from 'common/components/MenuItem';
import { Select } from 'common/components/Select';

let faker: Faker | null = null;
if (process.env.NODE_ENV === 'development') {
  void import('@faker-js/faker/locale/nl').then((mod2) => {
    faker = mod2.faker;
  });
}

export enum LightMode {
  COLOR = 0,
  WHITE = 1,
}

const MODE_ITEMS = observable.array([
  { value: LightMode.COLOR, label: 'Color', id: uuid() },
  { value: LightMode.WHITE, label: 'White', id: uuid() },
]);

interface Props extends DefaultProps {
  readonly getValue: () => LightMode;
  readonly onChange: (value: LightMode) => void;
}

const LightModeSelectBase: React.FC<Props> = ({ getValue, onChange }) => {
  useInterval(() => {
    runInAction(() => {
      MODE_ITEMS[1].label = faker?.music.genre() ?? 'White';
      // MODE_ITEMS.push({
      //   id: uuid(),
      //   value: MODE_ITEMS.length,
      //   label: faker.music.genre(),
      // });
    });
  }, 1000);

  return (
    <Select
      items={MODE_ITEMS}
      onChange={onChange}
      value={getValue}
      renderItem={(item) => (
        <MenuItem
          key={item.id}
          value={String(item.value)}
        >
          <Observer render={() => <span>{item.label}</span>} />
        </MenuItem>
      )}
    />
  );
};

export const LightModeSelect = styled(LightModeSelectBase)({});
