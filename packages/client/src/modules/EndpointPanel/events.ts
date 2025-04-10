import type { EventType } from 'common/utils/event';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const endpointAddButtonClicked = (): EventType<any> => {
  return {
    event: {
      source: 'EndpointPanel',
      timestamp: Date.now(),
    },
    payload: {},
    type: 'endpointAddButtonClicked',
  };
};
