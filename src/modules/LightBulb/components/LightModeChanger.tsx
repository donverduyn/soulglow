import React from 'react';
import type { Faker } from '@faker-js/faker';
import { styled } from '@mui/material/styles';
import { observable, runInAction } from 'mobx';
import { v4 as uuid } from 'uuid';
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

const LightModeChangerBase: React.FC<Props> = ({ getValue, onChange }) => {
  console.log('LightModeChangerBase', Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => {
      runInAction(() => {
        MODE_ITEMS[1].label = faker?.music.genre() ?? 'White';
        // MODE_ITEMS.push({
        //   id: uuid(),
        //   value: MODE_ITEMS.length,
        //   label: faker.music.genre(),
        // });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Select
      items={MODE_ITEMS}
      value={getValue}
      onChange={onChange}
    />
  );
};

export const LightModeChanger = styled(LightModeChangerBase)({});
