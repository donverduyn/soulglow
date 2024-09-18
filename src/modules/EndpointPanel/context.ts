import { Context, Layer, pipe, Queue } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';

const PREFIX = '@EndpointPanel';

export class InboundQueue extends Context.Tag(`${PREFIX}/InboundQueue`)<
  InboundQueue,
  Queue.Queue<EventType<unknown>>
>() {}

export class Foo extends Context.Tag(`${PREFIX}/Foo`)<Foo, string>() {}

export const EndpointPanelRuntime = createRuntimeContext(layer());

function layer() {
  return pipe(
    Layer.effect(InboundQueue, Queue.unbounded<EventType<unknown>>()),
    Layer.merge(Layer.succeed(Foo, 'foo'))
  );
}
