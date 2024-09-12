import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe, Queue } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import { addEndpointRequested } from 'common/models/endpoint/events';
import { fromLayer } from 'common/utils/context';
import type { EventType, Publishable } from 'common/utils/event';
import { AppRuntime, EventBus } from 'modules/App/context';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime, EndpointStore, InboundQueue } from './context';
import { createEndpoint } from './models/Endpoint';

interface Props extends Publishable {}

export const EndpointPanel = pipe(
  observer(EndpointPanelComponent as () => JSX.Element),
  WithRuntime(EndpointPanelRuntime, ({ inject, attachTo }) => {
    //
    inject(
      AppRuntime,
      (runFork): Props => ({
        publish: (msg: EventType<unknown>) =>
          runFork(fromLayer(EventBus, (bus) => bus.publish(msg))),
      })
    );
    //
    attachTo(AppRuntime, (runFork) =>
      fromLayer(EventBus, (bus) =>
        bus.register((event) =>
          runFork(fromLayer(InboundQueue, Queue.offer(event)))
        )
      )
    );
  })
);

function EndpointPanelComponent(props: Props) {
  const store = useRuntimeSync(EndpointPanelRuntime, EndpointStore);
  const { addEndpoint } = useEndpointPanel(props);

  return (
    <Paper css={styles.root}>
      <List
        render={() =>
          store.list.get().map((endpoint) => (
            <EndpointListItem
              key={endpoint.id}
              endpoint={endpoint}
              publish={props.publish}
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

function useEndpointPanel(props: Props) {
  const addEndpoint = React.useCallback(() => {
    const endpoint = createEndpoint();
    void props.publish(addEndpointRequested(endpoint));
  }, [props]);

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
