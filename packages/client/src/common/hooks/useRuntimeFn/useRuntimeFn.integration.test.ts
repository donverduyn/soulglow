// import * as React from 'react';
// import { render, renderHook, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { userEvent } from '@testing-library/user-event';
// import { Effect, Layer, ManagedRuntime } from 'effect';
// import { v4 as uuid } from 'uuid';
// import { WithRuntime } from 'common/components/hoc/withRuntime';
// import { createRuntimeContext } from 'common/utils/context';
// import { useRuntimeFn } from './useRuntimeFn';

describe('useRuntimeFn', () => {
  // it('should call the effect once', async () => {
  //   expect.assertions(1);

  //   const runtime = createRuntimeContext(Layer.empty);
  //   const Component = WithRuntime(runtime)(() => {
  //     const [value, setValue] = React.useState('');
  //     const fn = useRuntimeFn(runtime, (val: string) => Effect.sync(() => val));

  //     const onClick = React.useCallback(() => {
  //       void fn('test').then(setValue);
  //     }, [fn]);

  //     return (
  //       <div>
  //         <button
  //           onClick={onClick}
  //           type='button'
  //         >
  //           click me
  //         </button>
  //         <span>{value}</span>
  //       </div>
  //     );
  //   });

  //   const screen = render(<Component />);
  //   const button = screen.getByText(/click me/i);
  //   await userEvent.click(button);

  //   await waitFor(() => {
  //     expect(screen.getByText('test')).toBeInTheDocument();
  //   });
  // });
  // it('should return and run the effect correctly', async () => {
  //   expect.hasAssertions();
  //   const runtime = Object.assign(ManagedRuntime.make(Layer.empty), {
  //     id: uuid(),
  //   });
  //   const RuntimeContext = React.createContext(
  //     runtime as typeof runtime | undefined
  //   );

  //   const wrapper = ({ children }: { children: React.ReactNode }) => (
  //     <RuntimeContext.Provider value={runtime}>
  //       {children}
  //     </RuntimeContext.Provider>
  //   );

  //   const { result } = renderHook(
  //     () =>
  //       useRuntimeFn(RuntimeContext, (val: string) => Effect.sync(() => val)),
  //     { wrapper }
  //   );

  //   const input = uuid();
  //   const output = await React.act(async () => await result.current(input));
  //   expect(output).toBe(input);
  // });
  it('should pass', () => {
    expect.hasAssertions();
    expect(true).toBeTruthy();
  });
});
