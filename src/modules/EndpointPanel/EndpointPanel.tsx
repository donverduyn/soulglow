import * as React from 'react';
import { css } from '@mui/material/styles';
import { Effect, pipe, Queue, type Context } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { useReturn } from 'common/hooks/useReturn';
import type { EventType, Publishable } from 'common/utils/event';
import { AppRuntime } from 'modules/App/context';
import { createEndpoint } from 'modules/App/models/endpoint/endpoint';
import { addEndpointRequested } from 'modules/App/models/endpoint/events';
import AppTokens from 'modules/App/tokens';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime, Foo, InboundQueue } from './context';

interface Props extends OuterProps, InnerProps {}
interface InnerProps extends Publishable {
  readonly store: Context.Tag.Service<typeof AppTokens.EndpointStore>;
}
interface OuterProps {}

export const EndpointPanel = pipe(
  observer(EndpointPanel_ as (props: OuterProps) => React.JSX.Element),
  WithRuntime(EndpointPanelRuntime, ({ propsOf, to, from }) => {
    //
    // TODO: consider using decorator composition, but we have to think how to type "to", because it depends on the first argument to WithRuntime.

    propsOf(AppRuntime, ({ runFork, runSync }) => ({
      publish(msg: EventType<unknown>) {
        runFork(Effect.andThen(AppTokens.EventBus, (bus) => bus.publish(msg)));
      },
      store: runSync(AppTokens.EndpointStore),
    })) satisfies InnerProps;

    // TODO: use synchronizedRef to keep a reference to the store, in the component runtime, so it can be injected into effects
    from(AppRuntime, ({ runSync }) =>
      Effect.map(Foo, (_) => runSync(AppTokens.EndpointStore))
    );

    to(AppRuntime, ({ runFork }) =>
      Effect.andThen(AppTokens.EventBus, (bus) =>
        bus.register((event) =>
          runFork(Effect.andThen(InboundQueue, Queue.offer(event)))
        )
      )
    );
  })
);

function EndpointPanel_(props: Props) {
  const { publish, store } = props;
  const { addEndpoint } = useHandlers(props);

  //
  const renderList = React.useCallback(
    () =>
      store.list.get().map((endpoint) => (
        <EndpointListItem
          key={endpoint.id}
          endpoint={endpoint}
          publish={publish}
        />
      )),
    [store, publish]
  );

  return (
    <Paper css={styles.root}>
      <List render={renderList} />
      <Button
        css={styles.addButton}
        onClick={addEndpoint}
      >
        Add endpoint
      </Button>
    </Paper>
  );
}

function useHandlers({ publish }: Props) {
  const addEndpoint = React.useCallback(
    () => publish(addEndpointRequested(createEndpoint())),
    [publish]
  );

  return useReturn({ addEndpoint });
}

const styles = {
  addButton: css`
    --label: AddButton;
  `,
  root: css`
    --label: EndpointPanel;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0;
  `,
};
