import * as React from 'react';
import { css } from '@mui/material/styles';
import type { Okhsv } from 'culori';
import { Effect, identity, pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { State } from '__generated/api';
import { Select } from 'common/components/Select';
import { Slider } from 'common/components/Slider';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { WithRuntime as WithRuntime } from 'common/hoc/withRuntime';
import { useDeferred } from 'common/hooks/useEffectDeferred';
import { useMobx, useDeepObserve, useAutorun } from 'common/hooks/useMobx';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { useMessageBus } from 'context';
import { OnOffSwitch } from './components/OnOffSwitch';
import {
  LightMode,
  MODE_ITEMS,
  ApiThrottler,
  type LightbulbDto,
  LightBulbRuntime,
} from './context';

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

export const LightBulb = pipe(
  observer(LightBulbComponent),
  // WithProvider(LightBulbRuntime, LightBulbProvider, []),
  WithRuntime(LightBulbRuntime)
);

//TODO: think about default props and how to set them
function LightBulbComponent({
  className,
  getStyle,
  onChange = identity,
}: Props) {
  //
  const bus = useMessageBus([]);

  useDeferred(() => {
    // TODO: we should register on the action ENDPOINT_SELECT, so register should take an array of actions as the first argument and narrow message down to the payload of the action, the way angular does it with ngrx.

    // TODO: we should also think about using something similar as a behavior subject, so we can provide the last value to the service, when it is registered. This way we can avoid the need to store the url in the view model. This might be possible by using the new replay option of pubsub from Effect 3.5

    void bus.register((message) => {
      // TODO: from here we need to store the url so it can be provided as a nargument to the color service. We might want to think about a generic way to provide this kind of information to services. I'd say, just keep this state inside the view model by using a custom hook, but it might need a second thought, because of concurrent rendering.
      console.log('message from LightBulbComponent', message);
    });
  });

  const bulb = useMobx(() => defaultState);
  const inputs = bulb.bulb_mode === LightMode.WHITE ? whiteInputs : colorInputs;

  // const getThrottler = useRuntimeFn(LightBulbRuntime, ApiThrottler);
  // const { data: throttler } = useAsync(getThrottler);

  const handle = useRuntimeFn(LightBulbRuntime, (body: Partial<LightbulbDto>) =>
    Effect.gen(function* () {
      const queue = yield* ApiThrottler;
      yield* queue.offer(body);
    })
  );

  // useRuntime(
  //   LightBulbRuntime,
  //   Effect.gen(function* () {
  //     const repo = yield* DeviceRepo;
  //     const result = yield* repo.read();
  //     console.log(result?.color);
  //   })
  // );

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
      } as Partial<LightbulbDto>;
      // const rgb = formatRgb({mode: ''})
      void handle(body);
    },
    []
  );

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

const styles = {
  form: css`
    --label: Form;
    display: flex;
    flex-direction: column;
    gap: 1em;
  `,
  input: css`
    --label: SliderInput;
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 1em;
  `,
  root: css`
    --label: LightBulb;
    align-items: center;
    background: var(--background, #fff);
    border-radius: 12px;
    display: block;
    padding: 24px;
    transition: background-color 0.17s ease;
  `,
};
