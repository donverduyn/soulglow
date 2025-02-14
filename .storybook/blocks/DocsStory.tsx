/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-perf/jsx-no-new-object-as-prop */
import * as React from 'react';
import {
  Anchor,
  useOf,
  Description,
  Subheading,
  type DocsStoryProps,
} from '@storybook/blocks';
import { Canvas } from './Canvas';

export const DocsStory: React.FC<DocsStoryProps> = ({
  of,
  expanded = true,
  withToolbar: withToolbarProp = false,
  __forceInitialArgs = false,
  __primary = false,
}) => {
  const { story } = useOf(of || 'story', ['story']);

  // use withToolbar from parameters or default to true in autodocs
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const withToolbar = (story.parameters.docs?.canvas?.withToolbar ??
    withToolbarProp) as boolean;

  return (
    <Anchor storyId={story.id}>
      {expanded ? (
        <>
          <Subheading>{story.name}</Subheading>
          <Description of={of} />
        </>
      ) : null}
      <Canvas
        of={of}
        source={{ __forceInitialArgs }}
        story={{ __forceInitialArgs, __primary }}
        withToolbar={withToolbar}
      />
    </Anchor>
  );
};
