import type { EventType } from 'common/utils/event';

export const endpointAddButtonClicked = (): EventType<unknown> => {
  return {
    event: {
      source: 'EndpointPanel',
      timestamp: Date.now(),
    },
    name: 'endpointAddButtonClicked',
    payload: {},
  };
};
