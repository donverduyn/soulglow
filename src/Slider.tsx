/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-multi-comp */
import Slider, { SliderThumb } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { ValidatedColor } from './types/color';

interface Props<T extends string> {
  readonly color: ValidatedColor<T>;
  readonly style?: React.CSSProperties;
}

function MyComponent<T extends string>({ color, style }: Props<T>) {
  return (
    <div style={style}>
      <p>{color}</p>
    </div>
  );
}

// type TestContainsFormatError = ContainsFormatError<' format '>;

// type Test3 = Parameters<typeof StyledMyComponent>[0]['color'];

const StyledMyComponent = styled(MyComponent)(({ color }) => ({
  color: color,
}));

const TestComponent0 = () => {
  return (
    <MyComponent
      color='#dd'
      style={{ '--length': 5 }}
    />
  );
};

// const dynamicStyle = <T extends string>(props: { color: ValidateColor<T> }) =>
//   css({ color: props.color });

export const ColoredSlider = styled(Slider)(
  // dynamicStyle,
  (props) => ({
    color: props.color ?? '#52af77',
  }),

  {
    height: 8,
    '& .MuiSlider-track': {
      border: 'none',
    },
    '& .MuiSlider-thumb': {
      // height: 24,
      // width: 24,
      // backgroundColor: '#fff',
      border: '2px solid currentColor',
      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
        boxShadow: 'inherit',
      },
      '&::before': {
        display: 'none',
      },
      height: 27,
      width: 27,
      backgroundColor: '#fff',
      // border: '1px solid currentColor',
      '&:hover': {
        boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
      },
      '& .airbnb-bar': {
        height: 9,
        width: 1,
        backgroundColor: 'currentColor',
        marginLeft: 1,
        marginRight: 1,
      },
    },
    '& .MuiSlider-valueLabel': {
      lineHeight: 1.2,
      fontSize: 12,
      background: 'unset',
      padding: 0,
      width: 32,
      height: 32,
      borderRadius: '50% 50% 50% 0',
      backgroundColor: '#52af77',
      transformOrigin: 'bottom left',
      transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
      '&::before': { display: 'none' },
      '&.MuiSlider-valueLabelOpen': {
        transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
      },
      '& > *': {
        transform: 'rotate(45deg)',
      },
    },
  }
);

interface ThumbComponentProps extends React.HTMLAttributes<unknown> {}

export function ThumbComponent({ children, ...other }: ThumbComponentProps) {
  return (
    <SliderThumb {...other}>
      {children}
      <span className='airbnb-bar' />
      <span className='airbnb-bar' />
      <span className='airbnb-bar' />
    </SliderThumb>
  );
}
