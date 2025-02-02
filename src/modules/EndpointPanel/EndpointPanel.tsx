import * as React from 'react';
import { Effect, Queue, flow } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button/Button';
import { WithLabels } from 'common/components/hoc/withLabels';
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
import type { EventType } from 'common/utils/event';
import { createLabels } from 'common/utils/i18n';
import type { Labels, Locales } from 'common/utils/i18n';
import { memoize } from 'common/utils/memoize';
import { createEndpoint } from 'models/endpoint/Endpoint';
import { addEndpointRequested } from 'models/endpoint/EndpointEvents';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime } from './context';
import styles from './EndpointPanel.module.css';
import * as Tags from './tags';

interface Props {
  publish: <R>(msg: EventType<unknown>) => Promise<R>;
}
const labels = createLabels(['addEndpointLabel']);

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

const Component = flow(
  observer<Props>,
  WithLabels(labels),
  WithRuntime(EndpointPanelRuntime, (runtime) => {
    // TODO: Use request/response to avoid stale reads, before dispatching actions
    useRuntime(AppRuntime, registerInboundQueue(runtime), [runtime]);
    const publish = useRuntimeFn(AppRuntime, publishToBus, [runtime]);
    return useReturn({ publish });
  })
);

/**
 * This is the main component for the EndpointPanel module.
 * It displays a list of endpoints and allows the user to add new endpoints.
 */
export const EndpointPanel = Component(function EndpointPanel(props) {
  const { addEndpoint, endpoints, publish } = useEndpointPanel(props);
  // TODO: export type from utils to get a union of labels available in every lng
  const { text } = useTranslation<Labels<Locales>>();

  const renderList = React.useCallback(
    () =>
      endpoints.map((endpoint) => (
        <EndpointListItem
          key={endpoint.id}
          endpoint={endpoint}
          publish={publish}
        />
      )),
    [endpoints, publish]
  );

  return (
    <Stack className={styles.EndpointPanel}>
      <List render={renderList} />
      ddddd
      <Button onClick={addEndpoint}>{text(labels.addEndpointLabel)}</Button>
    </Stack>
  );
});

function useEndpointPanel({ publish }: Props) {
  // TODO: use normalized cache for entity collections and create mobx entity stores inside view models.
  // const runtime = React.use(EndpointPanelRuntime);
  // const rnt = React.use(AppRuntime)
  // const publish = useRuntimeFn(AppRuntime, publishToBus, [runtime]);
  const store = useRuntimeSync(EndpointPanelRuntime, Tags.EndpointStore);
  const endpoints = store.list;

  const addEndpoint = React.useCallback(() => {
    void publish(addEndpointRequested(createEndpoint()));
  }, [publish]);

  return useReturn({ addEndpoint, endpoints, publish });
}

// class Service {
//   constructor(private text: string) {
//     console.log(text);
//   }

//   sayText() {
//     console.log(this.text);
//   }
// }

// const useViewModel = () => {
//   const service = React.useRef(new Service('foo')).current;
// };
