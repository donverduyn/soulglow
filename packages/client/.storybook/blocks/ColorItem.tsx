import { ColorItem as SbColorItem } from '@storybook/blocks';
import { mapToDictionary } from 'common/utils/array';

const keys = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
];

export const ColorItem: typeof SbColorItem = (props) => {
  const { colors, ...rest } = props;
  const result = Array.isArray(colors)
    ? mapToDictionary(keys, (i) => i, colors)
    : colors;
  return (
    <SbColorItem
      {...rest}
      colors={result}
    />
  );
};
