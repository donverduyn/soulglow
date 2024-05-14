import * as React from 'react';
// import VolumeUp from '@mui/icons-material/VolumeUp';
import { styled } from '@mui/material/styles';
import MuiTextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';

interface InputProps<T> extends DefaultProps {
  readonly getValue: () => T;
  readonly onBlur?: () => void;
  readonly onChange: (value: T) => void;
}

const TextFieldBase = observer(
  <T,>({ className, getValue: value, onBlur, onChange }: InputProps<T>) => {
    //
    const handleBlur = React.useCallback(() => onBlur && onBlur(), [onBlur]);
    const handleInputChange = React.useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >((e) => onChange(e.target.value as T), [onChange]);

    const handleWheel = React.useCallback<
      React.WheelEventHandler<HTMLInputElement>
    >(
      (event) => {
        if (!event.deltaY) return;
        event.preventDefault();
        const adjustment = event.deltaY < 0 ? 0.1 : -0.1;
        onChange((Number(value()) + adjustment) as T);
      },
      [onChange, value]
    );

    return (
      <MuiTextField
        hiddenLabel
        className={className!}
        onBlur={handleBlur}
        onChange={handleInputChange}
        // onMouseOut={(e) => e.target.blur()} // Optional: Auto-blur when mouse leaves
        // onMouseOver={(e) => e.target.focus()} // Optional: Auto-focus on hover for better UX
        onWheel={handleWheel}
        size='small'
        value={value()}
        variant='outlined'
        inputProps={{
          'aria-labelledby': 'number-input',
          inputMode: 'numeric',
          max: 255,
          min: 0,
          pattern: '[0-9]*',
          step: 1,
          type: 'text',
        }}
      />
    );
  }
);

export const TextField = styled(TextFieldBase)`
  /* width: 100%; */
  /* background: color-mix(in srgb, #34c9eb 20%, white); */
  /* font-weight: bold; */
  /* font-size: 2em; */
  /* display: block; */
  /* flex-basis: content; */
  /* background: none; */

  & input:hover {
    /* cursor: pointer; // Changes the cursor to indicate scroll action */
    /* width: 3em; */
    /* padding-left: 1em; */
  }
` as typeof TextFieldBase;
