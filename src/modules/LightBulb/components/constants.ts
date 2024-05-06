import { observable } from 'mobx';
import { v4 as uuid } from 'uuid';

export enum LightMode {
  COLOR = 'color',
  WHITE = 'white',
}

export const MODE_ITEMS = observable.array([
  { id: uuid(), label: 'Color', value: LightMode.COLOR },
  { id: uuid(), label: 'White', value: LightMode.WHITE },
]);
