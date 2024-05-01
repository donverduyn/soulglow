import * as React from 'react';
import { styled } from '@mui/material';
import { default as MUISlider, SliderThumb } from '@mui/material/Slider';

interface Props extends DefaultProps {
  // eslint-disable-next-line react/no-unused-prop-types
  readonly color?: string;
  readonly style?: React.CSSProperties;
  readonly onChange: (value: number) => void;
}

const SliderBase: React.FC<Props> = ({ style, className, onChange }) => {
  return (
    <MUISlider
      className={className!}
      defaultValue={20}
      slots={{ thumb: ThumbComponent }}
      style={style!}
      valueLabelDisplay='auto'
      onChange={(_, value) => onChange(value as number)}
    />
  );
};

export const Slider = styled(SliderBase)`
  color: ${(props) => props.color ?? '#52af77'};
  & .MuiSlider-valueLabel {
    background-color: ${(props) => props.color ?? '#52af77'};
  }
  height: 8;
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
    height: 27;
    width: 27;
    background-color: #fff;
    &:hover {
      box-shadow: 0 0 0 8px rgba(58, 133, 137, 0.16);
    }
    & .bar {
      height: 9;
      width: 1;
      background-color: currentColor;
      margin-left: 1;
      margin-right: 1;
    }
  }
  & .MuiSlider-valueLabel {
    line-height: 1.2;
    font-size: 12;
    padding: 0;
    width: 32;
    height: 32;
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

interface ThumbComponentProps extends React.HTMLAttributes<unknown> {}

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
