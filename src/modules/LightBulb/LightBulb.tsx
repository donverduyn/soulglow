import * as React from 'react';
import { css } from '@mui/material/styles';
import type { Okhsv } from 'culori';
import { Effect, identity, pipe, Queue } from 'effect';
import { observer } from 'mobx-react-lite';
import { State } from '__generated/api';
import { Select } from 'common/components/Select';
import { Slider } from 'common/components/Slider';
import { Stack } from 'common/components/Stack';
import { TextField } from 'common/components/TextField';
import { WithRuntime as WithRuntime } from 'common/hoc/withRuntime';
import { useMobx, useDeepObserve, useAutorun } from 'common/hooks/useMobx';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { useStable } from 'common/hooks/useStable';
import { useMessageBus } from 'modules/App/hooks/useMessageBus';
import { OnOffSwitch } from './components/OnOffSwitch';
import {
  LightMode,
  MODE_ITEMS,
  type LightbulbDto,
  LightBulbRuntime,
  ApiThrottler,
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
  WithRuntime(LightBulbRuntime)
);

//TODO: think about default props and how to set them
function LightBulbComponent({
  className,
  getStyle,
  onChange = identity,
}: Props) {
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
  const bus = useMessageBus([]);
  // TODO: consider using an initial state from the backend which we use to hydrate the stores across multiple modules. For example, let's say we need the selected endpoint in LightbulbC and the list of endpoints in EndpointC. By hydrating the stores in the layer construction, we might want to use the root runtime, to provide an http client, which allows caching between multiple fetches. Then, after hydration, we use a central event log to replay the events on component remounts, when modules are reloaded. This can also be done during layer construction (this can all happen async, we might want to think about having some loading state, to decide what the use in case of the selected endpoint in this case). The only thing to consider, is that we would have to store derived state in the backend, just to avoid large event logs locally, unless we find a solution for this.

  React.useEffect(() => {
    // TODO: we should register on the action ENDPOINT_SELECT, so register should take an array of actions as the first argument and narrow message down to the payload of the action, the way angular does it with ngrx.
    // TODO: It makes sense for state updates to be replayed but actions not. Maybe we can subscribe to certain channels
    // void bus.register((message) => {
    //   console.log('message from LightBulbComponent', message);
    // });
  }, [bus]);

  const bulb = useMobx(() => defaultState);
  const inputs = bulb.bulb_mode === LightMode.WHITE ? whiteInputs : colorInputs;

  const updateColor = React.useCallback(
    (body: Partial<LightbulbDto>) =>
      ApiThrottler.pipe(Effect.andThen(Queue.offer(body))),
    [bus]
  );
  // TODO: accept inline functions. This requires thinking about what it means to recreate the effect in terms of queue timing, because this seems to break the implementation.
  const handle = useRuntimeFn(LightBulbRuntime, updateColor);

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

  return useStable({ bulb, inputs });
};

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
