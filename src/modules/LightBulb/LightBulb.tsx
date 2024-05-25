import * as React from 'react';
// import { grey } from '@mui/material/colors';
import { css } from '@mui/material/styles';
import type { Okhsv } from 'culori';
import { observer } from 'mobx-react-lite';
import {
  DeviceControlService,
  RemoteType,
  State,
  type GroupState,
  type GroupStateCommands,
} from '__generated/api';
import { Select } from 'common/components/Select';
import { Slider } from 'common/components/Slider';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useAutorun, useMobx, useDeepObserve } from 'common/hooks/useMobx';
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
  state: State;
}

interface LightBulbState {
  bulb_mode: LightMode;
  hue: number;
  level: number;
  saturation: number;
  status: State;
  temperature: number;
}

const defaultState: LightBulbState = {
  bulb_mode: LightMode.COLOR,
  hue: 270,
  level: 87,
  saturation: 70,
  status: State.OFF,
  temperature: 100,
};

/* eslint-disable typescript-sort-keys/interface */
interface Color {
  r: number;
  g: number;
  b: number;
}
/* eslint-enable typescript-sort-keys/interface */

// const inputCSS = {
//   colorTemp: css`
//     color: ${grey[800]};

//     & .MuiSlider-rail {
//       background-image: linear-gradient(to right, #ffd27f, #fff 50%, #9abad9);
//       opacity: 1;
//     }
//   `,
// };

const whiteInputs = [
  { key: 'temperature', label: 'temp', props: { max: 100, track: false } },
  { key: 'level', label: 'level' },
] as const;

const colorInputs = [
  { key: 'level', label: 'level', props: { max: 100 } },
  { key: 'saturation', label: 'saturation', props: { max: 100 } },
  { key: 'hue', label: 'hue', props: { max: 360 } },
] as const;

//
const handleSubmit = async (state: GroupState & GroupStateCommands) => {
  try {
    const deviceId = 5;
    const groupId = 5;
    const response =
      await DeviceControlService.putGatewaysByDeviceIdByRemoteTypeByGroupId({
        blockOnQueue: true,
        deviceId,
        groupId,
        remoteType: RemoteType.FUT089,
        requestBody: state,
      });

    console.log('Response:', response);
    // console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
};

const formSubmit: React.FormEventHandler<HTMLFormElement> = () => {
  // we can't really support formSubmit, unless we find a way to apply all settings at once.
  // it seems that this is not supported by the api but who knows
};

export const LightBulb: React.FC<LightBulbProps> = observer(
  ({ getStyle: getStyles, onChange }) => {
    const bulb = useMobx(() => defaultState);
    const inputs =
      bulb.bulb_mode === LightMode.WHITE ? whiteInputs : colorInputs;

    useAutorun(() => {
      onChange({
        h:
          (360 +
            bulb.hue +
            20 +
            20 * Math.sin((bulb.hue / 360) * 2 * Math.PI)) %
          360,
        mode: 'okhsv',
        s: 0.4 + (bulb.saturation / 100) * (1 - 0.4),
        v: 0.6 + (bulb.level / 100) * (1 - 0.6),
      });
    });

    useDeepObserve(bulb, (change) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // void handleSubmit({ [change.name]: change.newValue });
      // console.log('path:', change.name);
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
              value === State.ON ? true : false
            )}
            onChange={bulb.set('status', (value) =>
              value ? State.ON : State.OFF
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
