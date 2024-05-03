import * as React from 'react';
// import VolumeUp from '@mui/icons-material/VolumeUp';
import FormControl from '@mui/material/FormControl';
import MuiInput from '@mui/material/Input';
import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface InputProps<T> extends DefaultProps {
  readonly value: () => T;
  readonly onChange: (value: T) => void;
  readonly onBlur?: () => void;
}

const InputBase = observer(
  <T,>({ className, value, onBlur, onChange }: InputProps<T>) => {
    //
    const handleBlur = React.useCallback(() => onBlur && onBlur(), [onBlur]);
    const handleInputChange = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >((e) => onChange(e.target.value as T), [onChange]);

    return (
      <FormControl
        className={className!}
        variant='outlined'
      >
        <MuiInput
          onBlur={handleBlur}
          onChange={handleInputChange}
          size='medium'
          value={value()}
          inputProps={{
            step: 1,
            min: 0,
            max: 255,
            type: 'number',
            'aria-labelledby': 'input-slider',
          }}
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
