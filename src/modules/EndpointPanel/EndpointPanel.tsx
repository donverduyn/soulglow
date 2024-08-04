import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { WithRuntime } from 'common/hoc/withRuntime';
import { useAutorun } from 'common/hooks/useMobx';
import { useRuntimeSync } from 'common/hooks/useRuntimeFn';
import { useStable } from 'common/hooks/useStable';
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
  const bus = useMessageBus([store], 'EndpointPanel');

  React.useEffect(() => {
    // console.log(
    //   'register (current endpoint id)',
    //   store.list.get().map((item) => ({ ...item }))
    // );

    // TODO: we need a way to unsubscribe from the bus when the component is unmounted, because somehow the callback of register is called again with fast refresh, likely because of a stale reference in one of the hooks, causing the old item to be rendered on top of the new one.
    void bus.register((message) => {
      // console.log(message.payload)
      // @ts-expect-error, not yet narrowed with actions
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      store.add(message.payload);
      // console.log('store add', message);
    });
  }, [store, bus]);

  const addEndpoint = React.useCallback(() => {
    console.log('add endpoint');
    void bus.publish(endpointActions.add(createEndpoint()));
  }, [bus]);

  useAutorun(() => {
    // console.log('[autorun] count:', hello.showCount());
  }, [store]);

  return useStable({ addEndpoint, store });
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
