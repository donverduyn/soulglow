/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable vitest/prefer-expect-assertions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useCachedItem,
  useCachedItemId,
  setCachedItem,
} from './useExternalStore';

vi.useFakeTimers();

describe('useExternalStore', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('returns null by default', () => {
    let value: any;

    function TestComponent() {
      const id = useCachedItemId();
      value = useCachedItem(id);
      return null;
    }

    render(<TestComponent />);
    expect(value).toBeNull();
  });

  it('returns cached value after setCachedItem is called', () => {
    let id: symbol;
    let value: any;

    function TestComponent() {
      id = useCachedItemId();
      value = useCachedItem(id);
      return null;
    }

    render(<TestComponent />);
    act(() => {
      setCachedItem(id!, 'hello', 10000);
    });

    expect(value).toBe('hello');
  });

  it('expires value after TTL', () => {
    let id: symbol;
    let value: any;

    function TestComponent() {
      id = useCachedItemId();
      value = useCachedItem(id);
      return null;
    }

    render(<TestComponent />);
    act(() => {
      setCachedItem(id!, 'hello', 5000);
    });

    expect(value).toBe('hello');

    act(() => {
      vi.advanceTimersByTime(5001);
    });

    expect(value).toBeNull();
  });

  it('reacts to value changes across time', () => {
    const log: any[] = [];
    let id: symbol;

    function TestComponent() {
      id = useCachedItemId();
      const value = useCachedItem(id);
      React.useEffect(() => {
        log.push(value);
      }, [value]);

      return null;
    }

    render(<TestComponent />);

    act(() => {
      setCachedItem(id!, 'first', 10000);
    });

    act(() => {
      setCachedItem(id!, 'second', 10000);
    });

    expect(log).toEqual([null, 'first', 'second']);
  });

  it('revokes access to ephemeral symbol after short TTL', () => {
    let token: symbol | null = null;
    let internal: any;

    // Internal access hack — simulating system
    function TestComponent() {
      token = useCachedItemId();
      internal = useCachedItem(token);
      return null;
    }

    render(<TestComponent />);

    expect(token).toBeTypeOf('symbol');
    expect(internal).toBeNull();

    act(() => {
      vi.advanceTimersByTime(20);
    });

    // Now the ephemeralAccess should have deleted the store
    act(() => {
      setCachedItem(token!, 'oops', 10000);
    });

    // Still null – mutation failed
    expect(internal).toBeNull();
  });
});
