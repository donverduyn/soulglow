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
import { AppRuntime, EndpointStore, EventBus } from 'modules/App/context';
import { createEndpoint } from 'modules/App/models/endpoint/endpoint';
import { addEndpointRequested } from 'modules/App/models/endpoint/events';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime, InboundQueue } from './context';

interface OuterProps {}
interface InnerProps extends Publishable {
  readonly store: Context.Tag.Service<EndpointStore>;
}
interface Props extends OuterProps, InnerProps {}

// TODO: think about ways to avoid losing focus on fast refresh, because we recreate the component. This happens in WithRuntime, but also happens if you just use pipe. using the observer hoc doesn't cause problems on its own, so maybe it has the answer.

export const EndpointPanel = pipe(
  observer(EndpointPanel_ as (props: OuterProps) => React.JSX.Element),
  WithRuntime(EndpointPanelRuntime, ({ inject, attachTo }) => {
    //
    inject(AppRuntime, (runtime) => ({
      publish: (msg: EventType<unknown>) => {
        runtime.runSync(fromLayer(EventBus, (bus) => bus.publish(msg)));
      },
      store: runtime.runSync(EndpointStore),
    })) satisfies InnerProps;

    attachTo(AppRuntime, (runFork) =>
      fromLayer(EventBus, (bus) =>
        bus.register()((event) =>
          runFork(fromLayer(InboundQueue, Queue.offer(event)))
        )
      )
    );
  })
);

function EndpointPanel_(props: Props) {
  const { addEndpoint } = useEndpointPanel(props);
  //
  const renderList = React.useCallback(
    () =>
      props.store.list.get().map((endpoint) => (
        <EndpointListItem
          key={endpoint.id}
          endpoint={endpoint}
          publish={props.publish}
        />
      )),
    [props.store, props.publish]
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

function useEndpointPanel(props: Props) {
  const addEndpoint = React.useCallback(
    () => props.publish(addEndpointRequested(createEndpoint())),
    [props]
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
