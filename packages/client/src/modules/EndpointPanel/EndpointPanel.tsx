import * as React from 'react';
import { Effect, pipe, Context } from 'effect';
import type { RuntimeFiber } from 'effect/Fiber';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button/Button';
import { withRuntime } from 'common/components/hoc/withRuntime';
import { WithStatic } from 'common/components/hoc/withStatic';
import { List } from 'common/components/List/List';
import { Stack } from 'common/components/Stack/Stack';
import { useReturn } from 'common/hooks/useReturn/useReturn';
import { useTranslation } from 'common/hooks/useTranslation/useTranslation';
import type { EventType } from 'common/utils/event';
import { createLabels } from 'common/utils/i18n';
import type { Labels, Locales } from 'common/utils/i18n';
import { createEndpoint } from 'models/endpoint/Endpoint';
import { addEndpoint } from 'models/endpoint/EndpointEvents';
import { AppRuntime } from 'modules/App/App.runtime';
import * as AppTags from 'modules/App/tags';
import { EndpointListItem } from './components/EndpointListItem';
import styles from './EndpointPanel.module.css';
import { EndpointPanelRuntime } from './EndpointPanel.runtime';
import * as Tags from './tags';

interface Props {
  readonly id: string;
  readonly publish: (msg: EventType<unknown>) => Promise<void>;
  readonly store: Context.Tag.Service<typeof Tags.EntityStore>;
}
const labels = createLabels<Labels<Locales>>()(['addEndpointLabel']);

export const EndpointPanel = pipe(
  observer(EndpointPanelView),

  WithStatic({ labels }),
  // WithUpstream(AppRuntime),
  withRuntime(EndpointPanelRuntime, (configure, props) => {
    const R = configure({ debug: false });
    const store = R.use(Tags.EntityStore);

    const publish = R.useFn((e: EventType<unknown>) =>
      Effect.andThen(Tags.EventBus, (bus) => bus.publish(e))
    );
    const publishQuery = R.useFn(AppRuntime, (e: EventType<unknown>) =>
      Effect.andThen(AppTags.QueryBus, (bus) => bus.publish(e))
    );
    const publishCommand = R.useFn(AppRuntime, (e: EventType<unknown>) =>
      Effect.andThen(AppTags.CommandBus, (bus) => bus.publish(e))
    );
    const register = R.useFn(
      AppRuntime,
      (
        topic: string,
        handler: (e: EventType<unknown>) => RuntimeFiber<boolean>
      ) =>
        Effect.andThen(AppTags.ResponseBus, (bus) =>
          bus.register(topic, handler)
        )
    );

    // console.log('react use appruntime', React.use(AppRuntime));
    // R.useRun(Console.log('test EndpointPanelRuntime'));
    // R.useRun(AppRuntime, Console.log('test AppRuntime'));

    R.useRun(
      Effect.andThen(Tags.Initializer, (initializer) =>
        initializer.setup({
          componentId: props.id,
          publishCommand,
          publishQuery,
          register,
          runtimeId: R.runtime.id,
        })
      ),
      [props.id, publishCommand, publishQuery, register, R]
    );
    return { publish, store };
  })
);

/**
 * This is the main component for the EndpointPanel module.
 * It displays a list of endpoints and allows the user to add new endpoints.
 */
export function EndpointPanelView({ store, publish }: Props) {
  const { add, endpoints } = useEndpointPanel(store, publish);
  const { text } = useTranslation<Labels<Locales>>();
  // console.log('react use appruntime', React.use(AppRuntime));
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
        onClick={add}
      >
        {text(labels.addEndpointLabel)}
      </Button>
    </Stack>
  );
}

function useEndpointPanel(
  collection: Context.Tag.Service<typeof Tags.EntityStore>,
  publish: (msg: EventType<unknown>) => Promise<void>
) {
  const endpoints = collection.getStore('endpoint').list;
  const add = React.useCallback(() => {
    void publish(addEndpoint(createEndpoint()));
  }, [publish]);

  return useReturn({ add, endpoints });
}
