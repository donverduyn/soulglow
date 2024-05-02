import * as React from 'react';
import { blue, green, red } from '@mui/material/colors';
import { observer } from 'mobx-react-lite';
import { Input } from 'common/components/Input';
import { TestComponent } from 'common/components/Select';
import { Slider } from 'common/components/Slider';
import { useMobx } from 'common/hooks/useMobx';
import { LightMode, LightModeChanger } from './components/LightModeChanger';
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

const useLightBulbState = (state: LightBulbState) =>
  useMobx(() => ({
    ...state,
    togglePower() {
      this.isOn = !this.isOn;
    },
    changeMode(value: LightMode) {
      this.bulb_mode = value;
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

const LightBulbControl: React.FC = observer(() => {
  const lightBulb = useLightBulbState(defaultState);
  // useAutorun(() => console.log(toJS(lightBulb), Date.now()));

  const handleState = React.useCallback(
    () => (_: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      // const { name, value } = e.target
      // console.log({ name, value });
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <OnOffSwitch
        getValue={() => lightBulb.isOn}
        onChange={lightBulb.togglePower}
      />
      <br />
      <label>
        Brightness:
        <input
          max='100'
          min='0'
          name='brightness'
          type='range'
          value={lightBulb.brightness}
          onChange={handleState}
        />
      </label>
      <br />
      <LightModeChanger
        getValue={() => lightBulb.bulb_mode}
        onChange={lightBulb.changeMode}
      />
      <br />
      <TestComponent />
      <Slider
        aria-label='red slider'
        color={red[500]}
        getValue={() => lightBulb.color.r}
        onChange={lightBulb.changeRed}
      />
      <Input
        getValue={() => lightBulb.color.r}
        onChange={lightBulb.changeRed}
      />
      <Slider
        aria-label='green slider'
        color={green[500]}
        getValue={() => lightBulb.color.g}
        onChange={lightBulb.changeGreen}
      />
      <Input
        getValue={() => lightBulb.color.g}
        onChange={lightBulb.changeGreen}
      />
      <Slider
        aria-label='blue slider'
        color={blue[500]}
        getValue={() => lightBulb.color.b}
        onChange={lightBulb.changeBlue}
      />
      <Input
        getValue={() => lightBulb.color.b}
        onChange={lightBulb.changeBlue}
      />
      {/* <Button
        color='primary'
        type='submit'
        variant='contained'
      >
        Submit
      </Button> */}
    </form>
  );
});

export default LightBulbControl;
