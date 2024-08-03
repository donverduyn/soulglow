import React from 'react';
import { Effect } from 'effect';
import { useRuntimeFn } from 'common/hooks/useRuntimeFn';
import { useStable } from 'common/hooks/useStable';
import { MessageBus, AppRuntime } from 'modules/App/context';
import type { Message } from 'modules/App/models/message';

export const useMessageBus = (deps: unknown[], label?: string) => {
  const publishFn = React.useCallback(
    (message: Message) =>
      MessageBus.pipe(Effect.andThen((bus) => bus.publish(message))),
    deps
  );

  const registerFn = React.useCallback(
    (callback: <T>(message: T) => void) =>
      MessageBus.pipe(Effect.andThen((bus) => bus.register(callback))),
    deps
  );

  // TODO: consider using both an action bus and state bus, or a way to individually set the replay count for a subscription, such that we can replay on demand, but not replay actions such as delete etc.

  const publish = useRuntimeFn(AppRuntime, publishFn, 'publish ' + label!);
  const register = useRuntimeFn(AppRuntime, registerFn, 'register ' + label!);
  return useStable({ publish, register });
};
