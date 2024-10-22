import * as React from 'react';
import { css } from '@emotion/react';
import { Effect, pipe, Queue, type Context } from 'effect';
import { observer } from 'mobx-react-lite';
import { Button } from 'common/components/Button';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { List } from 'common/components/List';
import { Stack } from 'common/components/Stack';
import { useReturn } from 'common/hooks/useReturn';
import { useTranslation } from 'common/hooks/useTranslation';
import type { EventType, Publishable } from 'common/utils/event';
import { addEndpointRequested } from 'models/endpoint/events';
import { createEndpoint } from 'models/endpoint/model';
import { AppRuntime } from 'modules/App/context';
import * as AppTags from 'modules/App/tags';
import { EndpointListItem } from './components/EndpointListItem';
import { EndpointPanelRuntime } from './context';
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

    // TODO: The problem is that if multiple sagas read and write to the store, they can cause a race condition, so we have to queue actions in a channel inside a saga at the top level, which is in control of writing to and reading from the store. It dispatches actions that are listened to by the sagas downstream, so they can apply business logic based on up to date state from the store. Because we have per entity sagas and each saga has to both handle mutate actions as well as read actions, it is kind of logical to consider this conceptually around models. This means that even though any work is delegated back downstream, everything that is done at the top is module agnostic (modules are not associated with entities, but they rely on them to provide functionality). It is to say, that besides this separation and how modules combine different entities, modules also combine actions from different modules to show certain behavior.

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
    <Stack css={styles.root}>
      <List render={renderList} />
      <Button
        css={styles.addButton}
        onClick={addEndpoint}
      >
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

// TODO: use classname generator for label based on environment, because they will show up unminified in production. We still want to use labels because sometimes an extra component creates too much indirection?

const styles = {
  addButton: css`
    label: AddButton;
  `,
  root: css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0;
  `,
};
