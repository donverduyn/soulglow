import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useAutorun } from 'common/hooks/useMobx';
import { useReturn } from 'common/hooks/useReturn';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import { useMessageBus } from 'modules/App/hooks/useMessageBus';
import { endpointActions } from './actions';
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
      <List>
        {store.list.get().map((endpoint) => (
          <EndpointListItem
            key={endpoint.id}
            endpoint={endpoint}
          />
        ))}
      </List>
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
  const bus = useMessageBus([store]);

  React.useEffect(() => {
    void bus.register((message) => {
      // @ts-expect-error, not yet narrowed with actions
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      store.add(message.payload);
    });
  }, [store, bus]);

  const addEndpoint = React.useCallback(() => {
    const endpoint = createEndpoint();
    console.log('add endpoint', endpoint);
    void bus.publish(endpointActions.add(endpoint));
  }, [bus]);

  useAutorun(() => {
    // console.log('[autorun] count:', hello.showCount());
  }, [store]);

  return useReturn({ addEndpoint, store });
}

const styles = {
  addButton: css`
    --label: addButton;
    /* background: green; */
  `,
  root: css`
    --label: EndpointPanel;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0;
  `,
};
