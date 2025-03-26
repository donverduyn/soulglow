import type { configure } from 'mobx';

export const mobxConfig: Parameters<typeof configure>[0] = {
  computedRequiresReaction: true,
  enforceActions: 'always',
};
