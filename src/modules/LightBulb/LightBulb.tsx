import * as React from 'react';
import Button from '@mui/material/Button';
import { green } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import { autorun, toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Slider } from 'common/components/Slider';
import { useMobx } from 'common/hooks/useMobx';
import { OnOffSwitch } from './components/OnOffSwitch';
// import { throttle } from './utils/throttle';

interface Color {
  r: number;
  g: number;
  b: number;
}

enum LightMode {
  COLOR,
  WHITE,
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

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  console.log({ name, value });

  // if (name === 'brightness') {
  //   setLightBulb({ ...lightBulb, [name]: parseInt(value) });
  // } else if (name === 'r' || name === 'g' || name === 'b') {
  //   setLightBulb({ ...lightBulb, color: { ...lightBulb.color, [name]: parseInt(value) } });
  // } else {
  //   setLightBulb({ ...lightBulb, [name]: value });
  // }
};

const handleSubmit = (e: React.FormEvent) => {
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
  React.useEffect(() => autorun(() => console.log(toJS(lightBulb.color))));

  const handleState = React.useCallback(
    () => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      console.log({ name, value });
      // setLightBulb({ ...lightBulb, [name]: value });
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <OnOffSwitch
        getValue={() => lightBulb.isOn}
        onChange={() => lightBulb.togglePower()}
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
      {/* <label>
        Mode:
        <select
          name='bulb_mode'
          value={lightBulb.bulb_mode}
          onChange={handleState}
        >
          <option value='color'>Color</option>
          <option value='white'>White</option>
        </select>
      </label> */}
      {/* <ModeSelector
        getValue={() => lightBulb.bulb_mode}
        onChange={handleState}
      /> */}
      <br />
      <label>
        Red:
        <input
          name='color.r'
          type='number'
          value={lightBulb.color.r}
          onChange={handleState}
        />
      </label>
      <br />
      <label>
        Green:
        <input
          name='color.g'
          type='number'
          value={lightBulb.color.g}
          onChange={handleState}
        />
      </label>
      <br />
      <Typography gutterBottom>Green</Typography>
      <Slider
        aria-label='green slider'
        color={green[500]}
        onChange={(v) => lightBulb.changeGreen(v)}
      />
      {/* <Slider color='primary' value={lightBulb.color.b} valueLabelDisplay='on'>
      </Slider> */}
      <label>
        Blue:
        <input
          name='color.b'
          type='number'
          value={lightBulb.color.b}
          onChange={handleState}
        />
      </label>
      <br />
      <Button
        color='primary'
        type='submit'
        variant='contained'
      >
        Submit
      </Button>
    </form>
  );
});

export default LightBulbControl;
