import * as React from 'react';
import { Slider as MantineSlider, SliderProps } from '@mantine/core';
import cy from 'clsx';
import { observer } from 'mobx-react-lite';
import styles from './Slider.module.css';

interface Props extends Omit<SliderProps, 'onChange'> {
  readonly getValue: () => number;
  readonly max?: number;
  readonly min?: number;
  readonly onChange: (value: number) => void;
  readonly track?: false | 'normal';
}

export const Slider = observer(function Slider(props: Props) {
  const { className, min, max, track, getValue, onChange, ...rest } = props;

  const handleChange = React.useCallback(
    (value: number) => onChange(value),
    [onChange]
  );

  // TODO: find out why event handlers are attached on every hover, over the movable part of the slider. See devtools perf monitor.
  return (
    <MantineSlider
      className={cy(className, styles.Slider)}
      label={null}
      max={max ?? 255}
      min={min ?? 0}
      onChange={handleChange}
      step={0.1}
      value={getValue()}
      {...rest}
    />
  );
});
