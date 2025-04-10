interface Locatable {
  source: string;
}

interface TimeRelatable {
  timestamp: number;
}

export interface EventMetadata extends Locatable, Partial<TimeRelatable> {}

export interface Publishable<R = unknown> {
  readonly publish: (value: EventType<unknown>) => R;
}

export const createEventMetadata = (source: string): EventMetadata => ({
  source,
  timestamp: Date.now(),
});

export const createEvent =
  <T extends Record<string, unknown>>(type: string) =>
  <E extends EventMetadata>(payload: T, event?: E): EventType<T> => {
    return {
      event: event ?? createEventMetadata('unknown'),
      payload,
      type,
    };
  };

export const createEventFactory =
  <T1 extends unknown[], T2 extends Record<string, unknown>>(
    type: string,
    fn: (...args: T1) => T2
  ) =>
  (...args: Parameters<typeof fn>) =>
    createEvent(type)(fn(...args)) as EventType<T2>;

export type EventType<TPayload> = {
  event: EventMetadata;
  payload: TPayload;
  type: string;
};

// export type EventType<R, T = never, S extends string = string> = ReturnType<
//   ReturnType<typeof createEvent<S, T, R>>
// >;
