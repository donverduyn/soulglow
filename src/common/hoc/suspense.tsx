import * as React from 'react';

export const withAsync =
  <P extends object>(
    resolve: (a: P) => Promise<P>,
    optimistic: (a: P) => NoInfer<P>
  ) =>
  (Component: React.ComponentType) => {
    const Wrapper = (props: P) => {
      const resolved = resolve(props);
      console.log(resolved);
      // const fulfilled = useSuspense<P>(() => resolve(props));
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Component {...props} />
      );
    };

    // eslint-disable-next-line react/no-multi-comp
    const Boundary = (props: P) => {
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <React.Suspense fallback={<Component {...optimistic(props)} />}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Wrapper {...props} />
        </React.Suspense>
      );
    };

    return React.memo(Boundary);
  };

// withAsync((props) => props)(() => <div />);

// check out first how to integrate effect-rx with the current setup
// it seems that useRxSuspenseSuccess is the easiest way to get both access to the store and pubsub, because we can access the runtimes from the context, the way we do it now. we just need a different way to run the methods from effect-rx through the hooks.

// for now it makes most sense to have a view model that takes the bus and store and is responsible for reading the store, publishing messages and updating the store. It makes more sense to directly update the store instead of using effects at the module root. There's also the question where we want to update the stores. Directly from the effects or inside the view model instances only?

// Considering we need to sometimes synchronize stores in other modules the problem with vm level updates is that they are only applicable on the component level and not downstream. Using effects at the module root level to write to the stores could be more intuitive because of this reason, but it would likely require uniformity and so also the indirection of reading and updating the store in different places.
