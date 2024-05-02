import * as React from 'react';
// import VolumeUp from '@mui/icons-material/VolumeUp';
import FormControl from '@mui/material/FormControl';
import MuiInput from '@mui/material/Input';
import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface InputProps<T> extends DefaultProps {
  readonly getValue: () => T;
  readonly onChange: (value: T) => void;
  readonly onBlur?: () => void;
}

const InputBase = observer(
  <T,>({ getValue, onBlur, onChange }: InputProps<T>) => {
    //
    const handleBlur = React.useCallback(() => onBlur && onBlur(), [onBlur]);
    const handleInputChange = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >((e) => onChange(e.target.value as T), [onChange]);

    return (
      <FormControl variant='outlined'>
        <MuiInput
          size='medium'
          value={getValue()}
          inputProps={{
            step: 1,
            min: 0,
            max: 255,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
      </FormControl>
    );
  }
);

export const Input = styled(InputBase)`
  /* width: 100%;
  background: gray;
  font-weight: bold;
  font-size: 2em; */
` as typeof InputBase;
