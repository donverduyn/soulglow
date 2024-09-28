import * as React from 'react';
import { css } from '@mui/material/styles';
import type { Okhsv } from 'culori';
import { identity, pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { State } from '__generated/api';
import { WithRuntime as WithRuntime } from 'common/components/hoc/withRuntime';
import { Select } from 'common/components/Select';
import { Slider } from 'common/components/Slider';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { useMobx, useDeepObserve, useAutorun } from 'common/hooks/useMobx';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { fromLayer } from 'common/utils/context';
import type { Device } from 'models/device/Device';
import { OnOffSwitch } from './components/OnOffSwitch';
import { MODE_ITEMS, LightMode, LightBulbRuntime } from './context';
import * as Tags from './tags';

interface LightBulbState {
  bulb_mode: `${LightMode}`;
  hue: number;
  level: number;
  saturation: number;
  status: `${State}`;
  temperature: number;
}

const defaultState: LightBulbState = {
  bulb_mode: 'color',
  hue: 270,
  level: 87,
  saturation: 70,
  status: 'Off',
  temperature: 100,
};

interface Props extends DefaultProps {
  readonly getStyle: () => React.CSSProperties;
  readonly onChange: (value: Okhsv) => void;
}

const whiteInputs = [
  { key: 'temperature', label: 'temp', props: { max: 100, track: false } },
  { key: 'level', label: 'level' },
] as const;

const colorInputs = [
  { key: 'level', label: 'level', props: { max: 100 } },
  { key: 'saturation', label: 'saturation', props: { max: 100 } },
  { key: 'hue', label: 'hue', props: { max: 360 } },
] as const;

const Main = pipe(observer(LightBulb), WithRuntime(LightBulbRuntime));
export default Main;

//TODO: think about default props and how to set them
function LightBulb({ className, getStyle, onChange = identity }: Props) {
  const { bulb, inputs } = useLightBulbComponent(onChange);

  return (
    <Stack
      className={className}
      css={styles.root}
      getStyle={getStyle}
    >
      <form css={styles.form}>
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
          name='bulb_mode'
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

const useLightBulbComponent = (onChange: (value: Okhsv) => void) => {
  const bulb = useMobx(() => defaultState);
  const inputs = bulb.bulb_mode === LightMode.WHITE ? whiteInputs : colorInputs;

  // TODO: convert to event and use runtime to handle the event
  const handle = useRuntimeFn(LightBulbRuntime, (body: Partial<Device>) =>
    fromLayer(Tags.ApiThrottler, (queue) => queue.offer(body))
  );

  // TODO: think about how to model a lightbulb such that we can manage state in the form of an entity store, using the same patterns as endpoint.

  useAutorun(() => {
    const hue = 360 + bulb.hue + 30;
    const hueShift = (20 * Math.sin((bulb.hue / 360) * 2 * Math.PI)) % 360;
    const saturation = 0.4 + (bulb.saturation / 100) * (1 - 0.4);
    const value = 0.6 + (bulb.level / 100) * (1 - 0.6);

    onChange({
      h: hue + hueShift,
      mode: 'okhsv',
      s: saturation,
      v: value,
    });
  });

  useDeepObserve(
    bulb,
    (change) => {
      const body = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [change.name]: change.newValue,
      } as Partial<Device>;
      void handle(body);
    },
    [handle]
  );

  return useReturn({ bulb, inputs });
};

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
    transition: background-color 0.17s ease;
  `,
};
