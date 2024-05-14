import * as React from 'react';
import { default as MuiSlider, SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface Props<T> extends DefaultProps {
  readonly getValue: () => T;
  readonly max?: number;
  readonly min?: number;
  readonly onChange: (value: T) => void;
  readonly track?: false | 'normal';
}

// function inverseLogScale(
//   x: number,
//   xmin: number,
//   xmax: number,
//   ymin: number,
//   ymax: number
// ) {
//   const c = Math.log(xmax - xmin + 1);
//   return ((ymax - ymin) * (c - Math.log(x - xmin + 1))) / c + ymin;
// }

// // Example usage:
// const x = 10; // Your input value
// const xmin = 1;
// const xmax = 100;
// const ymin = 0;
// const ymax = 1;

// const scaledValue = inverseLogScale(x, xmin, xmax, ymin, ymax);
// console.log(scaledValue); // Output will start very low and increase as x approaches xmax

export const SliderBase = <T extends number>(props: Props<T>) => {
  const { className, min, max, track, getValue, onChange, ...rest } = props;
  const slots = React.useRef({ thumb: ThumbComponent });

  const handleChange = React.useCallback<
    (e: Event, v: number | number[]) => void
  >((_, v) => onChange(v as T), [onChange]);

  return (
    <MuiSlider
      className={className!}
      max={max ?? 255}
      min={min ?? 0}
      onChange={handleChange}
      slots={slots.current}
      track={track ?? 'normal'}
      value={getValue()}
      valueLabelDisplay='off'
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    />
  );
};

export const Slider = styled(observer(SliderBase))`
  --slider-color: var(--color, inherit);

  color: var(--slider-color);
  height: 8px;
  margin: 0 0.5em;

  & .MuiSlider-track {
    border: 0;
  }

  & .MuiSlider-thumb {
    background-color: #fff;
    border: 2px solid currentcolor;

    & .bar {
      background-color: currentcolor;
      height: 8px;
      margin-left: 1px;
      margin-right: 1px;
      width: 1px;
    }
  }
`;

interface ThumbComponentProps extends React.HTMLAttributes<EventTarget> {}

// eslint-disable-next-line react/no-multi-comp
const ThumbComponent: React.FC<ThumbComponentProps> = ({
  children,
  ...other
}) => {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SliderThumb {...other}>
      {children}
      <span className='bar' />
      <span className='bar' />
      <span className='bar' />
    </SliderThumb>
  );
};
