import * as React from 'react';
import { css } from '@mui/material/styles';
import { Effect, pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeFn, useRuntimeSync } from 'common/hooks/useRuntimeFn';
import { addEndpointRequested } from 'common/models/endpoint/events';
import { fromLayer } from 'common/utils/context';
import type { createEvent } from 'common/utils/event';
import { AppRuntime, MessageBus } from 'modules/App/context';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime, EndpointStore, Hello } from './context';
import { createEndpoint } from './models/Endpoint';

export const EndpointPanel = pipe(
  observer(EndpointPanelComponent),
  WithRuntime(EndpointPanelRuntime)
  // TODO: consider using WithSubscriber for cross cutting concerns between runtimes (subscribing to root event bus)
);

function EndpointPanelComponent() {
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);
  const { addEndpoint } = useEndpointPanel();

  const hello = useRuntimeFn(
    EndpointPanelRuntime,
    () => Hello.pipe(Effect.andThen((s) => s.sayHello)),
    []
  );

  console.log('hello');
  void hello(null);

  return (
    <Paper css={styles.root}>
      <List
        render={() =>
          store.list.get().map((endpoint) => (
            <EndpointListItem
              key={endpoint.id}
              endpoint={endpoint}
            />
          ))
        }
      />
      <Button
        css={styles.addButton}
        onClick={addEndpoint}
      >
        Add endpoint
      </Button>
    </Paper>
  );
}

function useEndpointPanel() {
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);

  const register = useRuntimeFn(
    AppRuntime,
    (callback: <T>(message: T) => void) =>
      fromLayer(MessageBus, (bus) => bus.register(callback)),
    [store]
  );

  React.useEffect(() => {
    void register((message) => {
      // @ts-expect-error, not yet narrowed with actions
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      store.add(message.payload.endpoint);
    });
  }, [register]);

  const publish = useRuntimeFn(
    AppRuntime,
    (msg: ReturnType<ReturnType<typeof createEvent>>) =>
      fromLayer(MessageBus, (bus) => bus.publish(msg)),
    []
  );

  const addEndpoint = React.useCallback(() => {
    const endpoint = createEndpoint();
    console.log('add endpoint', endpoint);
    void publish(addEndpointRequested(endpoint));
  }, [publish]);

  return useReturn({ addEndpoint });
}

const styles = {
  addButton: css`
    --label: addButton;
  `,
  root: css`
    --label: EndpointPanel;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0;
  `,
};
