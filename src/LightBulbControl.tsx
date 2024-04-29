import * as React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useThrottleFn } from 'react-use';
import * as R from 'remeda';
import { ThumbComponent, ColoredSlider } from './Slider';
// import { throttle } from './utils/throttle';
// import InputSlider from './InputSilder';

interface Color {
  r: number;
  g: number;
  b: number;
}

interface LightBulbState {
  state: string;
  brightness: number;
  bulb_mode: string;
  color: Color;
  // hello: { foo: { bar: { baz: string } } };
}

const defaultState: LightBulbState = {
  state: 'ON',
  brightness: 79,
  bulb_mode: 'color',
  color: { r: 255, g: 25, b: 167 },
};

// const createLensFromPath = <T,>() => ({
//   at: <Path extends string>(
//     path: Path | (NestedKeysAndIntersection<T, Path> & string)
//   ): Optic.Lens<T, PathType<T, Path>> => {
//     const parts = path.split('.');

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     return parts.reduce<Optic.Lens<T, any>>(
//       (acc, part) => acc.at(part),
//       Optic.id<T>()
//     ) as Optic.Lens<T, PathType<T, Path>>;
//   },
// });

// Example usage
// const colorGLens = createLensFromPath<LightBulbState>().at('color.g');

// const g = colorGLens.getOptic({
//   color: { g: 10, b: 5, r: 2 },
//   brightness: 10,
//   bulb_mode: 'color',
//   state: 'ON',
// });

// const colorLens = Optic.id<LightBulbState>().at('color');
// const increaseRed = Optic.modify(colorLens.at('r'))((r) => r + 1);

// increaseRed(defaultState);
// const brightnessLens = lens<LightBulbState>().prop('brightness');

// brightness

// color

//

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

const LightBulbControl: React.FC = observer(() => {
  const [lightBulb, setLightBulb] = React.useState<LightBulbState>(defaultState);

  useThrottleFn(
    (lightBulb) => {
      console.log('Throttled:', lightBulb);
    },
    1000,
    [lightBulb]
  );

  const { call: handleChange } = R.debounce(
    (e: Event, v: HTMLInputElement) => {
      console.log('Debounced', v);
    },
    { waitMs: 100, maxWaitMs: 100 }
  );

  const { state, changeState } = useLocalObservable(() => ({
    state: 'ON',
    changeState(e: React.ChangeEvent<HTMLSelectElement>) {
      this.state = e.target.value;
    },
    // brightness: 79,
    // bulb_mode: 'color',
    // state: 'ON',
  }));

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
      <label>
        State:
        <select
          name='state'
          value={state}
          onChange={changeState}
        >
          <option value='ON'>On</option>
          <option value='OFF'>Off</option>
        </select>
      </label>
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
      <label>
        Mode:
        <select
          name='bulb_mode'
          value={lightBulb.bulb_mode}
          onChange={handleState}
        >
          <option value='color'>Color</option>
          <option value='white'>White</option>
        </select>
      </label>
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
      <ColoredSlider
        aria-label='green slider'
        // customColor='#ff4000'
        defaultValue={20}
        valueLabelDisplay='auto'
        slots={{
          thumb: ThumbComponent /*, valueLabel: StyledValueLabel */,
        }}
        onChange={(e, v) => console.log(e)}
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
