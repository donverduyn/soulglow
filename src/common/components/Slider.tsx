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

export const SliderBase = <T extends number>(props: Props<T>) => {
  const { className, min, max, track, getValue, onChange } = props;
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
