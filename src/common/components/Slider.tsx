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
}

const SliderBase = observer(<T extends number>(props: Props<T>) => {
  const { className, min, max, style, getValue, onChange } = props;

  return (
    <MuiSlider
      className={className!}
      max={max ?? 255}
      min={min ?? 0}
      onChange={(_, value) => onChange(value as T)}
      slots={{ thumb: ThumbComponent }}
      style={{ ['--test' as string]: 'red' }}
      value={getValue()}
      valueLabelDisplay='off'
    />
  );
});

export const Slider = styled(SliderBase)`
  /* color: ${(props) => props.color ?? '#52af77'}; */
  color: inherit;
  height: 8px;
  margin: 0 0.5em;
  & .MuiSlider-valueLabel {
    /* background-color: ${(props) => props.color ?? '#52af77'}; */
  }
  & .MuiSlider-track {
    /* background-image: linear-gradient(to right, #ffd27f, #ffffff 50%, #9abad9); */
    background-size: auto;
    border: none;
  }
  & .MuiSlider-rail {
    /* background-image: linear-gradient(to right, #ffd27f, #ffffff 50%, #9abad9); */
  }
  & .MuiSlider-thumb {
    background-color: #fff;
    border: 2px solid currentColor;
    &:focus,
    &:hover,
    &.Mui-active,
    &.Mui-focusVisible {
      box-shadow: inherit;
    }
    &::before {
      display: none;
    }
    height: 20px;
    transition: left 0;
    width: 20px;
    &:hover {
      box-shadow: 0 0 0 8px rgba(58, 133, 137, 0.16);
    }
    & .bar {
      background-color: currentColor;
      height: 9px;
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
