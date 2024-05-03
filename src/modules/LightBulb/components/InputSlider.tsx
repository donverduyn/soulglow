import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { Slider } from 'common/components/Slider';
import { TextField } from 'common/components/TextField';

interface InputSliderProps extends DefaultProps {
  readonly color: string;
  readonly getValue: () => number;
  readonly label: string;
  readonly onChange: (value: number) => void;
}

const InputSliderBase: React.FC<InputSliderProps> = observer(
  ({ getValue, className, onChange, color, label }) => {
    return (
      <span className={className}>
        <Slider
          aria-label={label}
          color={color}
          getValue={getValue}
          max={255}
          onChange={onChange}
        />
        <TextField
          getValue={getValue}
          onChange={onChange}
        />
      </span>
    );
  }
);

export const InputSlider = styled(InputSliderBase)`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 1em;
`;
