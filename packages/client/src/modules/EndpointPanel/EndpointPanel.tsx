import * as React from 'react';
import { Effect, pipe, Context } from 'effect';
import type { RuntimeFiber } from 'effect/Fiber';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button/Button';
import { WithRuntime, WithUpstream } from 'common/components/hoc/withRuntime';
import { WithStatic } from 'common/components/hoc/withStatic';
import { List } from 'common/components/List/List';
import { Stack } from 'common/components/Stack/Stack';
import { useReturn } from 'common/hooks/useReturn/useReturn';
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
const labels = createLabels<Labels<Locales>>()(['addEndpointLabel']);

export const EndpointPanel = pipe(
  observer(EndpointPanelView),
  WithStatic({ labels }),
  WithUpstream(AppRuntime),
  WithRuntime(EndpointPanelRuntime, (configure, props) => {
    const λ = configure({ debug: true });
    const store = λ.use(Tags.EndpointStore);

    const publish = λ.useFn((e: EventType<unknown>) =>
      Effect.andThen(Tags.EventBus, (bus) => bus.publish(e))
    );
    const publishQuery = λ.useFn(AppRuntime, (e: QueryType<unknown>) =>
      Effect.andThen(AppTags.QueryBus, (bus) => bus.publish(e))
    );
    const publishCommand = λ.useFn(AppRuntime, (e: CommandType<unknown>) =>
      Effect.andThen(AppTags.CommandBus, (bus) => bus.publish(e))
    );
    const register = λ.useFn(
      AppRuntime,
      (handler: (e: EventType<unknown>) => RuntimeFiber<boolean>) =>
        Effect.andThen(AppTags.ResponseBus, (bus) => bus.register(handler))
    );

    λ.useRun(
      Effect.andThen(Tags.Initializer, (initializer) =>
        initializer.setup({
          componentId: props.id,
          publishCommand,
          publishQuery,
          register,
          runtimeId: λ.runtime.id,
        })
      ),
      [props.id, publishCommand, publishQuery, register, λ]
    );
    return { publish, store };
  })
);

/**
 * This is the main component for the EndpointPanel module.
 * It displays a list of endpoints and allows the user to add new endpoints.
 */
export function EndpointPanelView({ store, publish }: Props) {
  const { addEndpoint, endpoints } = useEndpointPanel(store, publish);
  const { text } = useTranslation<Labels<Locales>>();
  return (
    <Stack className={styles.EndpointPanel}>
      <List>
        {endpoints.map((endpoint) => (
          <EndpointListItem
            key={endpoint.id}
            endpoint={endpoint}
          />
        ))}
      </List>
      <Button
        color='gray.0'
        onClick={addEndpoint}
      >
        {text(labels.addEndpointLabel)}
      </Button>
    </Stack>
  );
}

function useEndpointPanel(
  store: Context.Tag.Service<typeof Tags.EndpointStore>,
  publish: (msg: EventType<unknown>) => Promise<void>
) {
  const endpoints = store.list;
  const addEndpoint = React.useCallback(() => {
    void publish(addEndpointRequested(createEndpoint()));
  }, [publish]);

  return useReturn({ addEndpoint, endpoints });
}
