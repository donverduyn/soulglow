import { styled } from '@mui/material';
import { flow } from 'effect';
import { Select } from '../../../common/components/Select';
import { LightMode } from '../LightBulb';

const MODE_ITEMS = [
  { value: LightMode.COLOR, label: 'Color' },
  { value: LightMode.WHITE, label: 'White' },
];

function getItemByMode(mode: LightMode) {
  return MODE_ITEMS.find((item) => item.value === mode);
}

interface Props extends DefaultProps {
  getValue: () => LightMode;
  onChange: <T>(value: T) => void;
}

const ModeSelectorBase: React.FC<Props> = ({ getValue, onChange }) => {
  return (
    <Select
      getValue={flow(getValue, getItemByMode)}
      items={MODE_ITEMS}
      onChange={onChange}
    />
  );
};

export const ModeSelector = styled(ModeSelectorBase)({
  //   width: '100%',
  //   height: 40,
  //   padding: '0 10px',
  //   borderRadius: 4,
  //   border: '1px solid #ccc',
});
