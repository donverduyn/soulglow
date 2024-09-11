import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useReturn } from 'common/hooks/useReturn';
import {
  useRuntime,
  useRuntimeFn,
  useRuntimeSync,
} from 'common/hooks/useRuntimeFn';
import { addEndpointRequested } from 'common/models/endpoint/events';
import { fromLayer } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import { AppRuntime, EventBus } from 'modules/App/context';
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
  const r = React.useContext(EndpointPanelRuntime);

  // TODO: find a way to add the runtime associated with this component to the dependency array of the useRuntimeFn. This is necessary to ensure that the functions are re-created when the runtime changes of this component, not a runtime of the parent component. We might need to create a linked list of runtimes where each runtime has a reference to the parent runtime. This way we always have a reference to the runtime of the component that hosts the useRuntimeFn. We can then use the linked list to find other runtimes based on the context that is provided to the useRuntimeFn. This also holds for the useRuntimeSync and useRuntime hooks as they also rely on the context for rerendering.
  const publish = useRuntimeFn(
    AppRuntime,
    (msg: EventType<unknown>) => fromLayer(EventBus, (bus) => bus.publish(msg)),
    [r]
  );

  const addEndpoint = React.useCallback(() => {
    const endpoint = createEndpoint();
    void publish(addEndpointRequested(endpoint));
  }, [publish]);

  useRuntime(
    AppRuntime,
    fromLayer(EventBus, (bus) =>
      bus.register((message) => {
        console.log(message);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error message.payload is not typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        store.add(message.payload.endpoint);
      })
    )
  );

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
