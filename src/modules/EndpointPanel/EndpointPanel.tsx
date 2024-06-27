import * as React from 'react';
import { css } from '@mui/material/styles';
import { Context, Effect, identity, pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { Paper } from 'common/components/Paper';
import { WithContextService } from 'common/hoc/withContextService';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useDeferred } from 'common/hooks/useEffectDeferred';
import { useStable } from 'common/hooks/useMemoizedObject';
import { useAutorun } from 'common/hooks/useMobx';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { useMessageBus, type RuntimeContext } from 'context';
import { EndpointListItem } from './components/EndpointListItem';
import {
  EndpointPanelRuntime,
  EndpointStore,
  StoreContext,
  createEndpointStore,
} from './context';
import { createEndpoint, type Endpoint } from './models/Endpoint';

type InferTag<T, R> =
  T extends Effect.Effect<infer A, infer E, infer R1>
    ? R1 extends R
      ? Effect.Effect<A, E, R>
      : never
    : never;

export type InferResult<T, R> =
  T extends Effect.Effect<infer A, infer E, infer R1>
    ? R1 extends R
      ? A
      : never
    : never;

// Helper type to check if a type extends from Array<Context.TagClass<any, any, any>>
type ExtendsEffectArray<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Array<Effect.Effect<any, any, any>> ? T : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type InferTagsNonEmpty<S extends any[], R> = S extends [
  infer First,
  ...infer Rest,
]
  ? ExtendsEffectArray<[First]> extends never
    ? never
    : [InferResult<First, R>, ...InferTagsNonEmpty<Rest, R>]
  : [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const fn: <R, S extends Array<Context.TagClass<any, any, any>>>(
  runtime: RuntimeContext<R>,
  services: [...S]
) => InferTagsNonEmpty<S, R>;

// const val = fn(EndpointPanelRuntime, [EndpointStore]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMap = <C, R, T extends Context.TagClass<any, any, any>>(
  context: React.Context<C>,
  config: [T, () => InferResult<T, R>]
) => new Map<React.Context<C>, [T, () => InferResult<T, R>]>();

// const map = createMap(StoreContext, [EndpointStore, createEndpointStore]);

const WithRuntimeServices = <
  R,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends Array<Effect.Effect<any, any, any>>,
>(
  runtime: RuntimeContext<R>,
  services: [...S]
) => {
  return <P,>(
    Component: React.FC<
      P & { getServices: (data: unknown) => Promise<InferTagsNonEmpty<S, R>> }
    >
  ) => {
    const Wrapper = (props: P) => {
      const getAll = pipe(services, Effect.forEach(Effect.map(identity)));
      const getServices = useRuntimeFn(runtime, getAll) as () => Promise<
        InferTagsNonEmpty<S, R>
      >;

      return (
        <Component
          {...props}
          getServices={getServices}
        />
      );
    };
    return Wrapper;
  };
};
// const test = WithRuntimeServices(EndpointPanelRuntime, [EndpointStore])(
//   ({ getServices }) => <div />
// );

export const EndpointPanel = pipe(
  observer(EndpointPanelC),
  // WithRuntimeServices(EndpointPanelRuntime, [EndpointStore]),
  WithContextService(
    EndpointPanelRuntime,
    EndpointStore,
    () => Object.assign(createEndpointStore(), { id: 'optimistic' }),
    StoreContext
  ),

  WithRuntime(EndpointPanelRuntime)
);

const createMessage =
  <T,>(message: string) =>
  (payload: T) => ({
    message,
    payload,
  });

const addEndpointMessage = createMessage<Endpoint>('ENDPOINT_ADD');

function useEndpointPanel() {
  const store = React.useContext(StoreContext)!.current;
  const bus = useMessageBus([store]);

  React.useEffect(() => {
    store.count.get() === 0 && store.add(createEndpoint());
  }, [store]);

  useDeferred(() => {
    void bus.register((message) => {
      // @ts-expect-error, not yet narrowed with actions
      store.add(message.payload);
    });
    void bus.register(console.log);
  }, [store]);

  useAutorun(() => {
    console.log('autorun', store.count.get());
  }, [store]);

  const addEndpoint = React.useCallback(() => {
    const endpoint = createEndpoint();
    void bus.publish(addEndpointMessage(endpoint));
  }, [bus]);

  return useStable({ addEndpoint, store });
}

// eslint-disable-next-line react/no-multi-comp
function EndpointPanelC({
  getServices,
}: {
  readonly getServices: () => Promise<[]>;
}) {
  const { addEndpoint, store } = useEndpointPanel();

  // React.useEffect(() => {
  //   void getServices().then(console.log);
  // }, [getServices]);

  return (
    <Paper css={styles.root}>
      {/* <Typography>Endpoints</Typography> */}
      {store.list.get().map((endpoint, index) => {
        return (
          <EndpointListItem
            key={endpoint.id}
            endpoint={endpoint}
            index={index}
          />
        );
      })}
      <Button
        css={styles.addButton}
        onClick={addEndpoint}
      >
        Add endpoint
      </Button>
    </Paper>
  );
}

const styles = {
  addButton: css`
    /* background: green; */
  `,
  endpoint: css`
    display: flex;
    flex-direction: row;
    gap: 1em;
    /* flex: 1; */
  `,
  root: css`
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0;
  `,
  textField: css`
    --label: TextField;
    flex: 1;
  `,
};
