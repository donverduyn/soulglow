import * as React from 'react';
import {
  ColorPalette,
  Controls,
  Description,
  Stories,
  Subtitle,
  Title,
  Primary,
} from '@storybook/blocks';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
// import type { Simplify } from 'type-fest';
// import * as AppTags from 'modules/App/tags';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { RuntimeDecorator } from '.storybook/decorators/RuntimeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { AppRuntime } from 'modules/App/context';
import EndpointPanel from './main';
// type Foo = Simplify<typeof AppTags>;

// TODO: import tags to type test implementation against them
// TODO: we need to think about how we want to spy on effectful deps
// const Component = WithRuntime(AppRuntime)(EndpointPanel);

const meta: Meta<typeof EndpointPanel> = {
  argTypes: {
    colorTheme: {
      control: { type: 'radio' },
      defaultValue: 'Light',
      options: ['Light', 'Dark'],
    },
  },
  component: EndpointPanel,
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator(),
    RuntimeDecorator(AppRuntime),
  ],
  // globals: { backgrounds: { value: 'light' } },
  // subcomponents: { EndpointListItem },
  parameters: {
    docs: {
      canvas: {
        // sourceState: 'shown',
      },
      page: function Page() {
        return (
          <>
            <Title />
            <Subtitle />
            <Description />
            <Primary />
            <Controls />
            <ColorPalette />
            <Stories />
          </>
        );
      },
      source: {
        // code: 'tsx',
      },
    },
    layout: 'centered',
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByText('Add Endpoint');
    await userEvent.click(button);
    await userEvent.click(button);
    await expect(button).toBeInTheDocument();
  },
  tags: ['autodocs'],
  title: '@EndpointPanel/Main',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Main: Story = {
  args: {},
};
