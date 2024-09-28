import { Layer, pipe, Queue } from 'effect';
import { createRuntimeContext } from 'common/utils/context';
import type { EventType } from 'common/utils/event';
import * as Tags from './tags';

export const EndpointPanelRuntime = pipe(
  Layer.effect(Tags.InboundQueue, Queue.unbounded<EventType<unknown>>()),
  Layer.merge(Layer.succeed(Tags.Foo, 'foo')),
  createRuntimeContext
);
