import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error not defined
globalThis.EMOTION_RUNTIME_AUTO_LABEL = true;

// because uuid is not tree-shakeable with cjs
vi.mock('uuid', () => ({ v4: () => crypto.randomUUID() }));
