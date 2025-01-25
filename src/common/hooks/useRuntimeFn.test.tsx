import * as React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Effect, Layer } from 'effect';
import { WithRuntime } from 'common/components/hoc/withRuntime';
import { createRuntimeContext } from 'common/utils/context';
import { useRuntimeFn } from './useRuntimeFn';

describe('useRuntimeFn', () => {
  it('should call the effect once', async () => {
    expect.assertions(1);

    const runtime = createRuntimeContext(Layer.empty);
    const Component = WithRuntime(runtime)(() => {
      const [value, setValue] = React.useState('');
      const fn = useRuntimeFn(runtime, (value: string) =>
        Effect.sync(() => value)
      );
      const onClick = React.useCallback(() => {
        void fn('test').then(setValue);
      }, [fn]);

      return (
        <div>
          <button
            onClick={onClick}
            type='button'
          >
            click me
          </button>
          <span>{value}</span>
        </div>
      );
    });
    const screen = render(<Component />);
    const button = screen.getByText(/click me/i);
    fireEvent.click(button);

    await waitFor(() => {
      const value = screen.getByText('test');
      expect(value).toBeInTheDocument();
    });
  });
});
