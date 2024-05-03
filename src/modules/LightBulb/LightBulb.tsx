import * as React from 'react';
import { styled } from '@mui/material';
import { blue, green, grey, red } from '@mui/material/colors';
import { observer } from 'mobx-react-lite';
import { Input } from 'common/components/Input';
import { Slider } from 'common/components/Slider';
import { useMobx } from 'common/hooks/useMobx';
import { LightMode, LightModeSelect } from './components/LightModeSelect';
import { OnOffSwitch } from './components/OnOffSwitch';

interface Color {
  r: number;
  g: number;
  b: number;
}

interface LightBulbState {
  isOn: boolean;
  brightness: number;
  bulb_mode: LightMode;
  color: Color;
}

const defaultState: LightBulbState = {
  isOn: true,
  brightness: 79,
  bulb_mode: LightMode.COLOR,
  color: { r: 255, g: 25, b: 167 },
};

const handleSubmit = () => {
  // e.preventDefault();
  // try {
  //   const response = await fetch('/api/gateways/desk-light', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(lightBulb),
  //   });
  //   console.log('Response:', await response.json());
  // } catch (error) {
  //   console.error('Error:', error);
  // }
};

// const useThrottledFn = <T extends any[], U>(
//   fn: (...args: T) => U,
//   options: Partial<Parameters<typeof throttle>[1]>
// ) => {
//   const debounced = React.useRef(throttle(fn, options));
//   return debounced.current;
// };

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const throttle = <T extends any[]>(fn: (...args: T) => void, delay: number) => {
//   let timeoutId: NodeJS.Timeout | null = null;
//   let lastArgs: T | null = null;

//   const throttledFn = (...args: T) => {
//     lastArgs = args;
//     if (!timeoutId) {
//       timeoutId = setTimeout(() => {
//         if (lastArgs) {
//           fn(...lastArgs);
//           lastArgs = null;
//         }
//         timeoutId = null;
//       }, delay);
//     }
//   };

//   return throttledFn;
// };

const useLightBulbState = (state: LightBulbState) =>
  useMobx(() => ({
    ...state,
    togglePower() {
      this.isOn = !this.isOn;
    },
    changeMode(value: LightMode) {
      this.bulb_mode = value;
    },
    changeBrightness(value: number) {
      this.brightness = value;
    },
    changeGreen(value: number) {
      this.color.g = value;
    },
    changeRed(value: number) {
      this.color.r = value;
    },
    changeBlue(value: number) {
      this.color.b = value;
    },
  }));

interface LightBulbProps extends DefaultProps {}

const LightBulbBase: React.FC<LightBulbProps> = observer(({ className }) => {
  const lightBulb = useLightBulbState(defaultState);
  // const throttledRed = useThrottledFn(lightBulb.changeRed, 1000);

  return (
    <section className={className}>
      <form onSubmit={handleSubmit}>
        <OnOffSwitch
          getValue={() => lightBulb.isOn}
          onChange={lightBulb.togglePower}
        />
        <LightModeSelect
          getValue={() => lightBulb.bulb_mode}
          onChange={lightBulb.changeMode}
        />
        <InputSlider
          color={grey[100]}
          label='brightness'
          onChange={lightBulb.changeBrightness}
          value={() => lightBulb.brightness}
        />
        <InputSlider
          color={red[500]}
          label='red'
          onChange={lightBulb.changeRed}
          value={() => lightBulb.color.r}
        />
        <InputSlider
          color={green[500]}
          label='green'
          onChange={lightBulb.changeGreen}
          value={() => lightBulb.color.g}
        />
        <InputSlider
          color={blue[500]}
          label='blue'
          onChange={lightBulb.changeBlue}
          value={() => lightBulb.color.b}
        />
      </form>
    </section>
  );
});

interface InputSliderProps extends DefaultProps {
  readonly value: () => number;
  readonly onChange: (value: number) => void;
  readonly color: string;
  readonly label: string;
}

// eslint-disable-next-line react-refresh/only-export-components
const InputSliderBase: React.FC<InputSliderProps> = observer(
  ({ value, className, onChange, color, label }) => {
    return (
      <span className={className}>
        <Slider
          aria-label={label}
          color={color}
          max={255}
          onChange={onChange}
          value={value}
        />
        <Input
          onChange={onChange}
          value={value}
        />
      </span>
    );
  }
);

const InputSlider = styled(InputSliderBase)`
  /* padding: 0.5em 0 1em 0.5em; */
  display: flex;
  flex-direction: row;
  gap: 1.25em;
  /* align-items: center; */
`;

export default styled(LightBulbBase)`
  background: #212121;
  border-radius: 0.25em;
  padding: 1.75em 1.5em;
  width: 15em;
  display: block;
  align-items: center;
  & form {
    display: flex;
    flex-direction: column;
    align-items: left;
    gap: 1.25em;
    /* align-items: center; */
  }
`;
