import * as React from 'react';
import type { PropsOf } from '@emotion/react';
import { default as MuiSlider } from '@mui/material/Slider';
import { css } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface Props<T> extends DefaultProps {
  readonly getValue: () => T;
  readonly max?: number;
  readonly min?: number;
  readonly onChange: (value: T) => void;
  readonly track?: false | 'normal';
}

export const Slider = observer(<T extends number>(props: Props<T>) => {
  const { className, min, max, track, getValue, onChange, ...rest } = props;

  const slotProps = React.useRef<PropsOf<typeof MuiSlider>['slotProps']>({
    track: { style: { border: 0 } },
  });
  const handleChange = React.useCallback<
    (e: Event, v: number | number[]) => void
  >((_, v) => onChange(v as T), [onChange]);

  return (
    <MuiSlider
      className={className!}
      css={sliderStyles.root}
      max={max ?? 255}
      min={min ?? 0}
      onChange={handleChange}
      slotProps={slotProps.current!}
      step={0.1}
      track={track ?? 'normal'}
      value={getValue()}
      valueLabelDisplay='off'
      {...rest}
    />
  );
});

const sliderStyles = {
  root: css`
    --slider-color: var(--color, inherit);
    color: var(--slider-color);
    height: 8px;
    margin: 0 0.5em;
  `,
};
