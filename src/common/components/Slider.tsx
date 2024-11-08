import * as React from 'react';
// import { css } from '@emotion/react';
import { Slider as MantineSlider, SliderProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';

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
      className={className!}
      // css={styles.root}
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

// const styles = {
//   root: css`
//     --slider-color: var(--color, inherit);
//     color: var(--slider-color);
//     flex: 1;
//     height: 8px;
//     margin: 0 0.5rem;
//   `,
// };
