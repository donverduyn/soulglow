import { Effect, Layer, PubSub } from 'effect';
import type { EventType } from 'common/utils/event';
import * as Tags from '../../tags';
import { EventBusProvider } from '../providers/EventBusProvider';

export const eventBusPubSubLayer = Layer.effect(
  Tags.EventBusPubSub,
  PubSub.unbounded<EventType<unknown>>({
    // replay: Number.POSITIVE_INFINITY,
  })
);

export const eventBusLayer = Layer.effect(
  Tags.EventBus,
  Effect.andThen(Tags.EventBusPubSub, (bus) => {
    return new EventBusProvider(bus);
  })
);
