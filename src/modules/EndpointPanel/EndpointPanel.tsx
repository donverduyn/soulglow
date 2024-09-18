import * as React from 'react';
import { css } from '@mui/material/styles';
import { pipe, Queue, type Context } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { List } from 'common/components/List';
import { Paper } from 'common/components/Paper';
import { useReturn } from 'common/hooks/useReturn';
import { fromLayer } from 'common/utils/context';
import type { EventType, Publishable } from 'common/utils/event';
import { AppRuntime, EventBus, EndpointStore } from 'modules/App/context';
import { createEndpoint } from 'modules/App/models/endpoint/endpoint';
import { addEndpointRequested } from 'modules/App/models/endpoint/events';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime, InboundQueue } from './context';

interface Props extends OuterProps, InnerProps {}
interface InnerProps extends Publishable {
  readonly store: Context.Tag.Service<EndpointStore>;
}
interface OuterProps {}

//
export const EndpointPanel = pipe(
  observer(EndpointPanel_ as (props: OuterProps) => React.JSX.Element),
  WithRuntime(EndpointPanelRuntime, ({ inject, attachTo }) => {
    //
    inject(AppRuntime, ({ runSync }) => ({
      publish: (msg: EventType<unknown>) => {
        runSync(fromLayer(EventBus, (bus) => bus.publish(msg)));
      },
      store: runSync(EndpointStore),
    })) satisfies InnerProps;

    attachTo(AppRuntime, (runFork) =>
      fromLayer(EventBus, (bus) =>
        bus.register((event) =>
          runFork(fromLayer(InboundQueue, Queue.offer(event)))
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
