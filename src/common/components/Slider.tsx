import * as React from 'react';
import { default as MUISlider, SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface Props<T> extends DefaultProps {
  readonly color?: string;
  readonly style?: React.CSSProperties;
  readonly value: () => T;
  readonly onChange: (value: T) => void;
  readonly min?: number;
  readonly max?: number;
}

const SliderBase = observer(<T extends number>(props: Props<T>) => {
  const { className, min, max, style, value, onChange } = props;

  // const handleChange = useThrottledFn(onChange, 100);

  return (
    <MUISlider
      className={className!}
      max={max ?? 255}
      min={min ?? 0}
      onChange={(_, value) => onChange(value as T)}
      slots={{ thumb: ThumbComponent }}
      style={style!}
      value={value()}
      valueLabelDisplay='off'
    />
  );
});

export const Slider = styled(SliderBase)`
  margin: 0 0.5em;
  height: 8px;
  color: ${(props) => props.color ?? '#52af77'};
  & .MuiSlider-valueLabel {
    background-color: ${(props) => props.color ?? '#52af77'};
  }
  & .MuiSlider-track {
    border: none;
  }
  & .MuiSlider-thumb {
    border: 2px solid currentColor;
    transition: left 0;
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
    width: 20px;
    background-color: #fff;
    &:hover {
      box-shadow: 0 0 0 8px rgba(58, 133, 137, 0.16);
    }
    & .bar {
      height: 9px;
      width: 1px;
      background-color: currentColor;
      margin-left: 1px;
      margin-right: 1px;
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
