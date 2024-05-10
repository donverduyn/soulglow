import * as React from 'react';
import { Stack } from '@mui/material';
import { blue, green, grey, red } from '@mui/material/colors';
import { css, styled } from '@mui/material/styles';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Select } from 'common/components/Select';
import { Slider } from 'common/components/Slider';
import { TextField } from 'common/components/TextField';
import { useAutorun, useMobx, useReaction } from 'common/hooks/useMobx';
import { LightMode, MODE_ITEMS } from './components/constants';
import { OnOffSwitch } from './components/OnOffSwitch';

interface LightBulbProps extends DefaultProps {}

interface LightBulbState {
  brightness: number;
  bulb_mode: LightMode;
  color: Color;
  color_temp: number;
  saturation: number;
  state: PowerState;
}

enum PowerState {
  OFF = 'OFF',
  ON = 'ON',
}

const defaultState: LightBulbState = {
  brightness: 79,
  bulb_mode: LightMode.COLOR,
  color: { b: 167, g: 25, r: 255 },
  color_temp: 100,
  saturation: 100,
  state: PowerState.OFF,
};

/* eslint-disable typescript-sort-keys/interface */
interface Color {
  r: number;
  g: number;
  b: number;
}
/* eslint-enable typescript-sort-keys/interface */
/* eslint-disable sort-keys-fix/sort-keys-fix */
const inputCSS = {
  red: css({ '--color': red[500] }),
  green: css({ color: green[500] }),
  blue: css({ color: blue[500] }),
  colorTemp: css({
    color: grey[800],
    '& .MuiSlider-rail': {
      opacity: 1,
      backgroundImage: `linear-gradient(
        to right, 
        #ffd27f, 
        #ffffff 50%, 
        #9abad9
      )`,
    },
  }),
};

const whiteInputs = [
  // eslint-disable-next-line prettier/prettier
  { label: 'color temp', value: 'color_temp', props: { css: inputCSS.colorTemp, track: false } },
  { label: 'brightness', value: 'brightness' },
] as const;

const colorInputs = [
  { label: 'red', value: 'color.r', props: { css: inputCSS.red } },
  { label: 'green', value: 'color.g', props: { css: inputCSS.green } },
  { label: 'blue', value: 'color.b', props: { css: inputCSS.blue } },
] as const;
/* eslint-enable sort-keys-fix/sort-keys-fix */

//
const handleSubmit = async ({
  brightness,
  bulb_mode,
  color,
  color_temp,
  saturation,
  state,
}: LightBulbState) => {
  try {
    const response = await fetch('/api/gateways/desk-light?blockOnQueue=true', {
      body: JSON.stringify({
        // brightness,
        // bulb_mode,
        // color_temp,
        // saturation,
        state,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('Error:', error);
  }
};

const formSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
  console.log('Form Submit', e);
};
//

const LightBulbBase: React.FC<LightBulbProps> = observer(({ className }) => {
  const bulb = useMobx(() => ({ ...defaultState }));
  const inputs = bulb.bulb_mode === LightMode.WHITE ? whiteInputs : colorInputs;

  useAutorun(() => {
    console.log('LightBulb:', toJS(bulb));
    void handleSubmit(bulb);
  });

  useReaction(
    () => bulb.bulb_mode,
    (current, prev) => {
      console.log('Reaction:', current, prev);
    }
  );

  return (
    <section className={className}>
      <form onSubmit={formSubmit}>
        <OnOffSwitch
          getValue={bulb.lazyGet('state', (value) =>
            value === PowerState.ON ? true : false
          )}
          onChange={bulb.set('state', (value) =>
            value ? PowerState.ON : PowerState.OFF
          )}
        />
        <Select
          getValue={bulb.lazyGet('bulb_mode')}
          items={MODE_ITEMS}
          label='Mode'
          onChange={bulb.set('bulb_mode')}
        />
        {inputs.map((input) => (
          <Stack
            key={input.label}
            className='input'
          >
            <Slider
              aria-label={input.label}
              getValue={bulb.lazyGet(input.value)}
              max={255}
              onChange={bulb.set(input.value)}
              // @ts-expect-error props does not exist
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...(input.props ?? {})}
            />
            <TextField
              getValue={bulb.lazyGet(input.value)}
              onChange={bulb.set(input.value)}
            />
          </Stack>
        ))}
      </form>
    </section>
  );
});

export const LightBulb = styled(LightBulbBase)(
  ({ theme }) => ({
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3.5, 3),
  }),
  {
    '& .input': {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      gap: '1em',
    },
    '& form': {
      alignItems: 'left',
      display: 'flex',
      flexDirection: 'column',
      gap: '1em',
    },
    alignItems: 'center',
    display: 'block',
    width: '15em',
  }
);
