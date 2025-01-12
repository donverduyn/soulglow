import * as React from 'react';
import { Effect, Queue, flow } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button/Button';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { List } from 'common/components/List/List';
import { Stack } from 'common/components/Stack/Stack';
import { useReturn } from 'common/hooks/useReturn';
import {
  useRuntime,
  useRuntimeFn,
  useRuntimeSync,
} from 'common/hooks/useRuntimeFn';
import { useTranslation } from 'common/hooks/useTranslation';
import type { RuntimeType } from 'common/utils/context';
import type { EventType, Publishable } from 'common/utils/event';
import { memoize } from 'common/utils/memoize';
import { addEndpointRequested } from 'models/endpoint/events';
import { createEndpoint } from 'models/endpoint/model';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import EndpointListItem from './components/EndpointListItem';
import { EndpointPanelRuntime } from './context';
import styles from './EndpointPanel.module.css';
import * as Tags from './tags';

interface Props extends OuterProps, InnerProps {}
interface InnerProps extends Publishable {}
export interface OuterProps {
  readonly foo: string;
}

export interface Translations {
  addEndpointLabel: string;
}

const registerInboundQueue = memoize(
  (runtime: RuntimeType<typeof EndpointPanelRuntime>) =>
    Effect.gen(function* () {
      const bus = yield* AppTags.EventBus;
      yield* bus.register((event) =>
        runtime.runFork(Effect.andThen(Tags.InboundQueue, Queue.offer(event)))
      );
    })
);

const publishToBus = (msg: EventType<unknown>) =>
  Effect.andThen(AppTags.EventBus, (bus) => bus.publish(msg));

//
const Component = flow(
  observer<Props>,
  WithRuntime(EndpointPanelRuntime, (runtime) => {
    // TODO: Use request/response to avoid stale reads, before dispatching actions
    useRuntime(AppRuntime, registerInboundQueue(runtime), [runtime]);

    const publish = useRuntimeFn(AppRuntime, publishToBus, [runtime]);
    return useReturn({ publish }) satisfies InnerProps;
  })
);

/**
 * This is the main component for the EndpointPanel module.
 * It displays a list of endpoints and allows the user to add new endpoints.
 */
const EndpointPanel = Component(function EndpointPanel(props: Props) {
  const { addEndpoint, endpoints } = useEndpointPanel(props);
  const { text } = useTranslation<Translations>();

  const renderList = React.useCallback(
    () =>
      endpoints.map((endpoint) => (
        <EndpointListItem
          key={endpoint.id}
          endpoint={endpoint}
          publish={props.publish}
        />
      )),
    [endpoints, props.publish]
  );

  return (
    <Stack className={styles.EndpointPanel}>
      <List render={renderList} />
      <Button onClick={addEndpoint}>
        {text('addEndpointLabel', {
          defaultValue: '',
        })}
      </Button>
    </Stack>
  );
});

export default EndpointPanel;

function useEndpointPanel({ publish }: Props) {
  // TODO: use normalized cache for entity collections and create mobx entity stores inside view models.
  const store = useRuntimeSync(AppRuntime, AppTags.EndpointStore);
  const endpoints = store.list.get();

  const addEndpoint = React.useCallback(
    () => publish(addEndpointRequested(createEndpoint())),
    [publish]
  );

  return useReturn({ addEndpoint, endpoints, publish });
}
