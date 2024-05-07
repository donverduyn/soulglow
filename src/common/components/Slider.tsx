import * as React from 'react';
import { default as MuiSlider, SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface Props<T> extends DefaultProps {
  readonly color?: string;
  readonly getValue: () => T;
  readonly max?: number;
  readonly min?: number;
  readonly onChange: (value: T) => void;
  readonly style?: React.CSSProperties;
  readonly track?: false | 'normal';
}

const SliderBase = observer(<T extends number>(props: Props<T>) => {
  const { className, min, max, track, getValue, onChange } = props;

  return (
    <MuiSlider
      className={className!}
      max={max ?? 255}
      min={min ?? 0}
      onChange={(_, value) => onChange(value as T)}
      slots={{ thumb: ThumbComponent }}
      style={{ ['--test' as string]: 'red' }}
      track={track ?? 'normal'}
      value={getValue()}
      valueLabelDisplay='off'
    />
  );
});

export const Slider = styled(SliderBase)`
  --slider-color: var(--color, inherit);
  color: var(--slider-color);
  height: 8px;
  margin: 0 0.5em;
  & .MuiSlider-track {
    border: 0;
  }
  & .MuiSlider-thumb {
    background-color: #fff;
    border: 2px solid currentColor;
    /* box-shadow: 0px 0px 0px 0px color-mix(in srgb, var(--slider-color) 16%, transparent); */
    &:hover,
    &:focus {
      /* box-shadow: 0px 0px 0px 8px color-mix(in srgb, var(--slider-color) 16%, transparent); */
    }
    & .bar {
      background-color: currentColor;
      height: 8px;
      margin-left: 1px;
      margin-right: 1px;
      width: 1px;
    }
  }
`;

interface ThumbComponentProps extends React.HTMLAttributes<EventTarget> {}

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
