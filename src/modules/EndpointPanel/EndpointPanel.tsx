import * as React from 'react';
// import { css } from '@emotion/react';
import { Effect, pipe, Queue, type Context } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button/Button';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { List } from 'common/components/List/List';
import { Stack } from 'common/components/Stack/Stack';
import { useReturn } from 'common/hooks/useReturn';
import { useTranslation } from 'common/hooks/useTranslation';
import type { EventType, Publishable } from 'common/utils/event';
import { addEndpointRequested } from 'models/endpoint/events';
import { createEndpoint } from 'models/endpoint/model';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import EndpointListItem from './components/EndpointListItem';
import { EndpointPanelRuntime } from './context';
import styles from './EndpointPanel.module.css';
import * as Tags from './tags';

interface Props extends OuterProps, InnerProps {}
interface InnerProps extends Publishable {
  readonly store: Context.Tag.Service<typeof AppTags.EndpointStore>;
}
export interface OuterProps {}

export interface Translations {
  addEndpointLabel: string;
}

const Main = pipe(
  observer(EndpointPanel as (props: OuterProps) => React.JSX.Element),
  WithRuntime(EndpointPanelRuntime, ({ propsOf, to, from }) => {
    //
    // TODO: consider using decorator composition, but we have to think how to type "to", because it depends on the first argument to WithRuntime.

    propsOf(AppRuntime, ({ runFork, runSync }) => ({
      publish(msg: EventType<unknown>) {
        runFork(Effect.andThen(AppTags.EventBus, (bus) => bus.publish(msg)));
      },
      store: runSync(AppTags.EndpointStore),
    })) satisfies InnerProps;

    // TODO: Use request/response to avoid stale reads, before dispatching actions

    from(AppRuntime, ({ runSync }) =>
      Effect.map(Tags.Foo, (_) => runSync(AppTags.EndpointStore))
    );

    to(AppRuntime, ({ runFork }) =>
      Effect.andThen(AppTags.EventBus, (bus) =>
        bus.register((event) =>
          runFork(Effect.andThen(Tags.InboundQueue, Queue.offer(event)))
        )
      )
    );
  })
);

export default Main;
function EndpointPanel(props: Props) {
  const { publish, store } = props;
  const { addEndpoint } = useHandlers(props);
  const { text } = useTranslation<Translations>();

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
    <Stack className={styles.EndpointPanel}>
      <List render={renderList} />
      <Button onClick={addEndpoint}>
        {text('addEndpointLabel', {
          defaultValue: 'Add Endpoint',
        })}
      </Button>
    </Stack>
  );
}

function useHandlers({ publish }: Props) {
  const addEndpoint = React.useCallback(
    () => publish(addEndpointRequested(createEndpoint())),
    [publish]
  );

  return useReturn({ addEndpoint });
}
