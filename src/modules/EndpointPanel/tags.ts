import { Context, type Queue } from 'effect';
import type { EventType } from 'common/utils/event';

const PREFIX = '@EndpointPanel';

class InboundQueue extends Context.Tag(`${PREFIX}/InboundQueue`)<
  InboundQueue,
  Queue.Queue<EventType<unknown>>
>() {}

class Foo extends Context.Tag(`${PREFIX}/Foo`)<Foo, string>() {}

export { InboundQueue, Foo };
