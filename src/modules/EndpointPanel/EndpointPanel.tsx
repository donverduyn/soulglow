import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeFn, useRuntimeSync } from 'common/hooks/useRuntimeFn';
import { addEndpointRequested } from 'common/models/endpoint/events';
import { fromLayer } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { AppRuntime, MessageBus } from 'modules/App/context';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime, EndpointStore } from './context';
import { createEndpoint } from './models/Endpoint';

export const EndpointPanel = pipe(
  observer(EndpointPanelComponent),
  WithRuntime(EndpointPanelRuntime)
);

function EndpointPanelComponent() {
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);
  const { addEndpoint } = useEndpointPanel();

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

  const publish = useRuntimeFn(AppRuntime, (msg: EventType<unknown>) =>
    fromLayer(MessageBus, (bus) => bus.publish(msg))
  );
  const register = useRuntimeFn(
    AppRuntime,
    (fn: (message: EventType<unknown>) => void) =>
      fromLayer(MessageBus, (bus) => bus.register(fn))
  );

  const addEndpoint = React.useCallback(() => {
    const endpoint = createEndpoint();
    void publish(addEndpointRequested(endpoint));
  }, [publish]);

  React.useEffect(() => {
    void register((message) => {
      console.log(message);
      // @ts-expect-error message.payload is not typed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      store.add(message.payload.endpoint);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register]);

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
