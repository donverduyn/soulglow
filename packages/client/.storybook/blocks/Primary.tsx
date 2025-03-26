/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { useContext } from 'react';
import { useOf, Primary as SbPrimary, DocsContext } from '@storybook/blocks';
import { DocsStory } from './DocsStory';

export const Primary: typeof SbPrimary = (props) => {
  const { of } = props;
  if ('of' in props && of === undefined) {
    throw new Error(
      'Unexpected `of={undefined}`, did you mistype a CSF file reference?'
    );
  }

  const { csfFile } = useOf(of || 'meta', ['meta']);
  const context = useContext(DocsContext);

  const primaryStory = context.componentStoriesFromCSFFile(csfFile)[0];

  return primaryStory ? (
    <DocsStory
      __primary
      withToolbar
      expanded={false}
      of={primaryStory.moduleExport}
    />
  ) : null;
};
