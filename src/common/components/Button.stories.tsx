import { PropsOf } from '@emotion/react';
import { Flex } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, fn } from '@storybook/test';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { capitalize } from 'common/utils/string';
import { Button } from './Button';

const variants = [
  'filled',
  // 'gradient',
  'light',
  'outline',
  'white',
  'subtle',
  'transparent',
];

const meta: Meta<typeof Button> = {
  argTypes: {
    onClick: {
      table: { disable: true },
    },
  },
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Button',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: variants,
    },
  },
  args: { children: 'Default Button', variant: 'outline' },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  // globals: { backgrounds: { disabled: true } },
};

const VariantsTemplate = (props: PropsOf<typeof Button>) => {
  return (
    <Flex
      gap='sm'
      // maw='40rem'
      wrap='wrap'
    >
      {variants.map((variant) => (
        <Button
          {...props}
          key={variant}
          variant={variant}
        >
          {`${capitalize(variant)} Button`}
        </Button>
      ))}
    </Flex>
  );
};

export const VariantsDark: Story = {
  args: {},
  decorators: [
    ThemeDecorator({
      forceColorScheme: 'dark',
    }),
  ],
  // globals: { backgrounds: { value: 'dark' } },
  render: VariantsTemplate,
};

export const VariantsLight: Story = {
  args: {},
  decorators: [ThemeDecorator({ forceColorScheme: 'light' })],
  // globals: { backgrounds: { value: 'light' } },
  render: VariantsTemplate,
};

const createVariantsStory = (
  args: PropsOf<typeof Button> & Partial<Parameters<typeof ThemeDecorator>[0]>
): Story => ({
  args,
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark', theme: args.theme ?? {} }),
  ],
  // globals: { backgrounds: { disabled: true } },
  render: VariantsTemplate,
});

// export const VariantsBlue: Story = createVariantsStory({ color: 'blue' });
// export const VariantsGreen: Story = createVariantsStory({ color: 'green' });
// export const VariantsRed: Story = createVariantsStory({ color: 'red' });
// export const VariantsCrimson: Story = createVariantsStory({ color: 'crimson' });
// export const VariantsYellow: Story = createVariantsStory({ color: 'yellow' });
// export const VariantsOrange: Story = createVariantsStory({ color: 'orange' });
// export const VariantsGray: Story = createVariantsStory({ color: 'gray' });
// export const VariantsIndigo: Story = createVariantsStory({ color: 'indigo' });
export const VariantsColor: Story = createVariantsStory({
  color: 'pink',
  theme: { primaryShade: { dark: 4, light: 4 } },
});
// export const VariantsTeal: Story = createVariantsStory({ color: 'teal' });
// export const VariantsCyan: Story = createVariantsStory({ color: 'cyan' });
// export const VariantsLime: Story = createVariantsStory({ color: 'lime' });
// export const VariantsViolet: Story = createVariantsStory({ color: 'violet' });
// export const VariantsGrape: Story = createVariantsStory({ color: 'grape' });

export const VariantsDisabled: Story = {
  args: { disabled: true },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  // globals: { backgrounds: { disabled: true } },
  render: VariantsTemplate,
};

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
const SizesTemplate = (props: PropsOf<typeof Button>) => (
  <Flex
    align='baseline'
    gap='sm'
    wrap='wrap'
  >
    {sizes.map((size) => (
      <Button
        {...props}
        key={size}
        autoContrast
        size={size}
      >
        {`${capitalize(size)} Button`}
      </Button>
    ))}
  </Flex>
);

const createSizesStory = (args: PropsOf<typeof Button>): Story => ({
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: variants,
    },
  },
  args,
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  // globals: { backgrounds: { disabled: true } },
  render: SizesTemplate,
});

export const Sizes = createSizesStory({ variant: 'filled' });
// export const SizesGradient = createSizesStory({ variant: 'gradient' });
// export const SizesLight = createSizesStory({ variant: 'light' });
// export const SizesOutline = createSizesStory({ variant: 'outline' });
// export const SizesSubtle = createSizesStory({ variant: 'subtle' });
// export const SizesTransparent = createSizesStory({ variant: 'transparent' });
// export const SizesWhite = createSizesStory({ variant: 'white' });

export const Clickable: Story = {
  args: {
    children: 'Clickable Button',
    onClick: fn(),
  },
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  globals: { backgrounds: { disabled: true } },
  tags: ['!autodocs'],
};

Clickable.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const button = canvas.getByText('Clickable Button');
  await userEvent.click(button);
  await expect(button).toBeInTheDocument();
};
