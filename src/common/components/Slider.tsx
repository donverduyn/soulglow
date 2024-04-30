/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-multi-comp */
import * as React from 'react';
import { styled } from '@mui/material';
import { default as MUISlider, SliderThumb } from '@mui/material/Slider';

interface Props extends DefaultProps {
  readonly color?: string;
  readonly style?: React.CSSProperties;
  readonly onChange: (value: number) => void;
}

// function MyComponent<T extends string>({ color, style }: Props<T>) {
//   return (
//     <div style={style}>
//       <p>{color}</p>
//     </div>
//   );
// }

// const StyledMyComponent = styled(MyComponent<'#fff'>)(({ color }) => ({
//   color: color,
// }));
const SliderBase: React.FC<Props> = ({ style, className, onChange }) => {
  return (
    <MUISlider
      className={className!}
      defaultValue={20}
      style={style!}
      valueLabelDisplay='auto'
      slots={{
        thumb: ThumbComponent /*, valueLabel: StyledValueLabel */,
      }}
      onChange={(_, value) => onChange(value as number)}
    />
  );
};

export const Slider = styled(SliderBase)(
  (props) => ({
    color: props.color ?? '#52af77',
    '& .MuiSlider-valueLabel': {
      backgroundColor: props.color ?? '#52af77',
    },
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
      // background: 'unset',
      padding: 0,
      width: 32,
      height: 32,
      borderRadius: '50% 50% 50% 0',
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

function ThumbComponent({ children, ...other }: ThumbComponentProps) {
  return (
    <SliderThumb {...other}>
      {children}
      <span className='airbnb-bar' />
      <span className='airbnb-bar' />
      <span className='airbnb-bar' />
    </SliderThumb>
  );
}
