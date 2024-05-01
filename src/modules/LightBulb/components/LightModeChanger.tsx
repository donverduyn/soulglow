import { styled } from '@mui/material';
import { Select } from 'common/components/Select';

export enum LightMode {
  COLOR = 0,
  WHITE = 1,
}

const MODE_ITEMS = [
  { value: LightMode.COLOR, label: 'Color' },
  { value: LightMode.WHITE, label: 'White' },
];

interface Props extends DefaultProps {
  getValue: () => LightMode;
  onChange: (value: LightMode) => void;
}

const LightModeChangerBase: React.FC<Props> = ({ getValue, onChange }) => {
  return (
    <Select
      getValue={getValue}
      items={MODE_ITEMS}
      onChange={onChange}
    />
  );
};

export const LightModeChanger = styled(LightModeChangerBase)({
  //   width: '100%',
  //   height: 40,
  //   padding: '0 10px',
  //   borderRadius: 4,
  //   border: '1px solid #ccc',
});
