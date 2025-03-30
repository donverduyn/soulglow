import * as React from 'react';
import { Effect, pipe, Context, Ref } from 'effect';
import type { RuntimeFiber } from 'effect/Fiber';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button/Button';
import { WithLabels } from 'common/components/hoc/withLabels';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { List } from 'common/components/List/List';
import { Stack } from 'common/components/Stack/Stack';
import { useReturn } from 'common/hooks/useReturn/useReturn';
import {
  useRuntimeFn,
  useRuntimeSync,
} from 'common/hooks/useRuntimeFn/useRuntimeFn';
import { useTranslation } from 'common/hooks/useTranslation/useTranslation';
import type { CommandType } from 'common/utils/command';
import type { EventType } from 'common/utils/event';
import { createLabels } from 'common/utils/i18n';
import type { Labels, Locales } from 'common/utils/i18n';
import type { QueryType } from 'common/utils/query';
import { createEndpoint } from 'models/endpoint/Endpoint';
import { addEndpointRequested } from 'models/endpoint/EndpointEvents';
import { AppRuntime } from 'modules/App/App.runtime';
import * as AppTags from 'modules/App/tags';
import { EndpointListItem } from './components/EndpointListItem';
import styles from './EndpointPanel.module.css';
import { EndpointPanelRuntime } from './EndpointPanel.runtime';
import * as Tags from './tags';

interface Props {
  readonly id: string;
  readonly publish: (msg: EventType<unknown>) => Promise<void>;
  readonly store: Context.Tag.Service<typeof Tags.EndpointStore>;
}
const labels = createLabels(['addEndpointLabel']);

export const EndpointPanel = pipe(
  observer(EndpointPanelView),
  WithLabels(labels),
  WithRuntime(EndpointPanelRuntime, (configure, props) => {
    const runtime = configure({ debug: true });
    const store = useRuntimeSync(runtime, Tags.EndpointStore, [runtime]);

    const publish = useRuntimeFn(runtime, (e: EventType<unknown>) =>
      Effect.andThen(Tags.EventBus, (bus) => bus.publish(e))
    );
    const publishQuery = useRuntimeFn(
      AppRuntime,
      (e: QueryType<unknown>) =>
        Effect.andThen(AppTags.QueryBus, (bus) => bus.publish(e)),
      [runtime]
    );
    const publishCommand = useRuntimeFn(
      AppRuntime,
      (e: CommandType<unknown>) =>
        Effect.andThen(AppTags.CommandBus, (bus) => bus.publish(e)),
      [runtime]
    );
    const register = useRuntimeFn(
      AppRuntime,
      (handler: (e: EventType<unknown>) => RuntimeFiber<boolean | string>) =>
        Effect.andThen(AppTags.ResponseBus, (bus) => bus.register(handler)),
      [runtime]
    );

    React.useEffect(() => {
      runtime.runFork(
        Effect.andThen(
          Tags.InitializerRef,
          Ref.update(({ componentId }) => ({
            componentId: props.id ?? componentId,
            initialized: true,
            publishCommand,
            publishQuery,
            register,
            runtimeId: runtime.id,
          }))
        )
      );
    }, [props.id, publishCommand, publishQuery, register, runtime]);
    return { publish, store };
  })
);

/**
 * This is the main component for the EndpointPanel module.
 * It displays a list of endpoints and allows the user to add new endpoints.
 */
export function EndpointPanelView({ store, publish }: Props) {
  const { addEndpoint, endpoints } = useEndpointPanel(store, publish);
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
      <Button onClick={addEndpoint}>{text(labels.addEndpointLabel)}</Button>
    </Stack>
  );
}

function useEndpointPanel(
  store: Context.Tag.Service<typeof Tags.EndpointStore>,
  publish: (msg: EventType<unknown>) => Promise<void>
) {
  // TODO: use normalized cache for entity collections and create mobx entity stores inside view models.
  const endpoints = store.list;

  const addEndpoint = React.useCallback(() => {
    void publish(addEndpointRequested(createEndpoint()));
  }, [publish]);

  return useReturn({ addEndpoint, endpoints });
}
