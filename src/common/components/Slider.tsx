import * as React from 'react';
import { default as MUISlider, SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface Props<T> extends DefaultProps {
  // eslint-disable-next-line react/no-unused-prop-types
  readonly color?: string;
  readonly style?: React.CSSProperties;
  readonly getValue: () => T;
  readonly onChange: (value: T) => void;
}

const SliderBase = <T extends number>({
  style,
  className,
  onChange,
  getValue,
}: Props<T>) => {
  return (
    <MUISlider
      className={className!}
      // defaultValue={}
      max={255}
      min={0}
      slots={{ thumb: ThumbComponent }}
      style={style!}
      value={getValue()}
      valueLabelDisplay='auto'
      onChange={(_, value) => onChange(value as T)}
    />
  );
};

export const Slider = styled(observer(SliderBase))`
  color: ${(props) => props.color ?? '#52af77'};
  & .MuiSlider-valueLabel {
    background-color: ${(props) => props.color ?? '#52af77'};
  }
  height: 8px;
  & .MuiSlider-track {
    border: none;
  }
  & .MuiSlider-thumb {
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
    height: 27px;
    width: 27px;
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
  & .MuiSlider-valueLabel {
    line-height: 1.2em;
    font-size: 12px;
    padding: 0;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform-origin: bottom left;
    transform: translate(50%, -100%) rotate(-45deg) scale(0);
    &::before {
      display: none;
    }
    &.MuiSlider-valueLabelOpen {
      transform: translate(50%, -100%) rotate(-45deg) scale(1);
    }
    & > * {
      transform: rotate(45deg);
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
