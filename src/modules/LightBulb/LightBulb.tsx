import * as React from 'react';
import { grey } from '@mui/material/colors';
import { css } from '@mui/material/styles';
import type { Okhsv } from 'culori';
import { observer } from 'mobx-react-lite';
import { Select } from 'common/components/Select';
import { Slider } from 'common/components/Slider';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useAutorun, useMobx } from 'common/hooks/useMobx';
import { LightMode, MODE_ITEMS } from './components/constants';
import { OnOffSwitch } from './components/OnOffSwitch';

interface LightBulbProps extends DefaultProps {
  readonly getStyle: () => React.CSSProperties;
  readonly onChange: (value: Okhsv) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface LightBulbDto {
  brightness: number;
  bulb_mode: LightMode;
  color: Color;
  color_temp: number;
  saturation: number;
  state: PowerState;
}

interface LightBulbState {
  hue: number;
  level: number;
  mode: LightMode;
  saturation: number;
  status: PowerState;
  temperature: number;
}

enum PowerState {
  OFF = 'OFF',
  ON = 'ON',
}

const defaultState: LightBulbState = {
  hue: 250,
  level: 60,
  mode: LightMode.COLOR,
  saturation: 20,
  status: PowerState.OFF,
  temperature: 100,
};

/* eslint-disable typescript-sort-keys/interface */
interface Color {
  r: number;
  g: number;
  b: number;
}
/* eslint-enable typescript-sort-keys/interface */

const inputCSS = {
  colorTemp: css`
    color: ${grey[800]};

    & .MuiSlider-rail {
      background-image: linear-gradient(to right, #ffd27f, #fff 50%, #9abad9);
      opacity: 1;
    }
  `,
};

const whiteInputs = [
  {
    key: 'temperature',
    label: 'temperature',
    props: { css: inputCSS.colorTemp, track: false },
  },
  { key: 'level', label: 'level' },
] as const;

const colorInputs = [
  {
    key: 'level',
    label: 'level',
    props: { max: 100 },
  },
  { key: 'saturation', label: 'saturation', props: { max: 100 } },
  { key: 'hue', label: 'hue', props: { max: 360 } },
] as const;

//
const handleSubmit = async (status: LightBulbState['status']) => {
  try {
    const response = await fetch('/api/gateways/desk-light?blockOnQueue=true', {
      body: JSON.stringify({ status }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    console.log('Response:', await response.json());
  } catch (error) {
    console.error('Error:', error);
  }
};

const formSubmit: React.FormEventHandler<HTMLFormElement> = () => {
  // we can't really support formSubmit, unless we find a way to apply all settings at once. it seems that this is not supported by the api but who knows
};

export const LightBulb: React.FC<LightBulbProps> = observer(
  ({ getStyle: getStyles, onChange }) => {
    const bulb = useMobx(() => defaultState);
    const inputs = bulb.mode === LightMode.WHITE ? whiteInputs : colorInputs;

    useAutorun(() => {
      void handleSubmit(bulb.status);
    });
    useAutorun(() => {
      onChange({
        h: bulb.hue,
        mode: 'okhsv',
        s: bulb.saturation / 100,
        v: bulb.level / 100,
      });
    });

    return (
      <Stack
        css={styles.root}
        getStyle={getStyles}
      >
        <form
          css={styles.form}
          onSubmit={formSubmit}
        >
          <OnOffSwitch
            getValue={bulb.lazyGet('status', (value) =>
              value === PowerState.ON ? true : false
            )}
            onChange={bulb.set('status', (value) =>
              value ? PowerState.ON : PowerState.OFF
            )}
          />
          <Select
            getValue={bulb.lazyGet('mode')}
            items={MODE_ITEMS}
            label='Mode'
            onChange={bulb.set('mode')}
          />
          {inputs.map((input) => (
            <Stack
              key={input.label}
              css={styles.input}
            >
              <Slider
                aria-label={input.label}
                getValue={bulb.lazyGet(input.key)}
                max={255}
                onChange={bulb.set(input.key)}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error props does not exist
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(input.props ?? {})}
              />
              <TextField
                getValue={bulb.lazyGet(input.key)}
                onChange={bulb.set(input.key)}
              />
            </Stack>
          ))}
        </form>
      </Stack>
    );
  }
);

const styles = {
  form: css`
    display: flex;
    flex-direction: column;
    gap: 1em;
  `,
  input: css`
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 1em;
  `,
  root: css`
    align-items: center;
    background: var(--background, #fff);
    border-radius: 12px;
    display: block;
    padding: 24px;
  `,
};
