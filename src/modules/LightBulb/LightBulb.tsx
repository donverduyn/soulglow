import * as React from 'react';
import { styled } from '@mui/material';
import { blue, green, grey, red } from '@mui/material/colors';
import { observer } from 'mobx-react-lite';
import { useMobx } from 'common/hooks/useMobx';
import { InputSlider } from './components/InputSlider';
import { LightMode, LightModeSelect } from './components/LightModeSelect';
import { OnOffSwitch } from './components/OnOffSwitch';

/* eslint-disable typescript-sort-keys/interface */
interface Color {
  r: number;
  g: number;
  b: number;
}
/* eslint-enable typescript-sort-keys/interface */

interface LightBulbState {
  brightness: number;
  bulb_mode: LightMode;
  color: Color;
  color_temp: number;
  isOn: boolean;
}

const defaultState: LightBulbState = {
  brightness: 79,
  bulb_mode: LightMode.COLOR,
  color: { b: 167, g: 25, r: 255 },
  color_temp: 100,
  isOn: true,
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
    changeBlue(value: number) {
      this.color.b = value;
    },
    changeBrightness(value: number) {
      this.brightness = value;
    },
    changeColorTemp(value: number) {
      this.color_temp = value;
    },
    changeGreen(value: number) {
      this.color.g = value;
    },
    changeMode(value: LightMode) {
      this.bulb_mode = value;
    },
    changeRed(value: number) {
      this.color.r = value;
    },
    togglePower() {
      this.isOn = !this.isOn;
    },
  }));

interface LightBulbProps extends DefaultProps {}

// eslint-disable-next-line react-refresh/only-export-components
const LightBulbBase: React.FC<LightBulbProps> = observer(({ className }) => {
  const lightBulb = useLightBulbState(defaultState);
  // const lightBulb2 = useMobx(() => defaultState);
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
        {lightBulb.bulb_mode === LightMode.WHITE && (
          <>
            <InputSlider
              color={grey[100]}
              getValue={() => lightBulb.color_temp}
              label='color temp'
              onChange={lightBulb.changeColorTemp}
            />
            <InputSlider
              color={grey[100]}
              getValue={() => lightBulb.brightness}
              label='brightness'
              onChange={lightBulb.changeBrightness}
            />
          </>
        )}
        {lightBulb.bulb_mode === LightMode.COLOR && (
          <>
            <InputSlider
              color={red[500]}
              getValue={() => lightBulb.color.r}
              label='red'
              onChange={lightBulb.changeRed}
            />
            <InputSlider
              color={green[500]}
              getValue={() => lightBulb.color.g}
              label='green'
              onChange={lightBulb.changeGreen}
            />
            <InputSlider
              color={blue[500]}
              getValue={() => lightBulb.color.b}
              label='blue'
              onChange={lightBulb.changeBlue}
            />
          </>
        )}
      </form>
    </section>
  );
});

export default styled(LightBulbBase)`
  align-items: center;
  background: #212121;
  border-radius: 0.25em;
  display: block;
  padding: 1.75em 1.5em;
  width: 15em;
  & form {
    align-items: left;
    display: flex;
    flex-direction: column;
    gap: 1em;
    /* align-items: center; */
  }
`;
