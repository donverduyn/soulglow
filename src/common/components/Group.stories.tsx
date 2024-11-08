import { Paper, Flex, Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { Group } from './Group';

const GroupTemplate = (props: React.ComponentProps<typeof Group>) => {
  const items = ['one', 'two', 'three'];
  return (
    <Group
      {...props}
      bd='1px solid gray'
      flex={1}
    >
      {items.map((item) => (
        <Paper
          key={item}
          bg='gray.4'
          p='md'
          radius={0}
        >
          {item}
        </Paper>
      ))}
    </Group>
  );
};

const meta: Meta<typeof Group> = {
  component: Group,
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  parameters: { layout: 'centered' },
  render: GroupTemplate,
  tags: ['autodocs'],
  title: 'Common/Group',
};

export default meta;
type Story = StoryObj<typeof meta>;

const justifyOptions = ['flex-end', 'flex-start', 'center', 'space-between'];
const gapOptions = ['xs', 'sm', 'md', 'lg', 'xl'];

export const Default: Story = {
  argTypes: {
    gap: {
      control: { type: 'select' },
      options: gapOptions,
    },
    grow: {
      control: { type: 'boolean' },
    },
    justify: {
      control: { type: 'select' },
      options: justifyOptions,
    },
  },
  args: {
    children: 'Default Group',
    gap: 'md',
    grow: false,
    justify: 'flex-start',
  },
  // globals: { backgrounds: { disabled: true } },
};

const createVariantsTemplate = <P extends React.ComponentProps<typeof Group>>(
  options: string[],
  prop: keyof P
) =>
  // eslint-disable-next-line react/function-component-definition
  function VariantsTemplate(props: P) {
    return (
      <Flex
        direction='column'
        flex={1}
        rowGap='md'
      >
        {options.map((option) => {
          const extraProps = { [prop]: option };
          return (
            <Flex
              key={option}
              align='center'
              direction='row'
            >
              <Text w='10rem'>{option}</Text>
              <GroupTemplate
                {...props}
                {...extraProps}
              />
            </Flex>
          );
        })}
      </Flex>
    );
  };

export const VariantsJustify: Story = {
  args: { children: 'Spaced Group' },
  render: createVariantsTemplate(justifyOptions, 'justify'),
};

export const VariantsGap: Story = {
  args: { children: 'Aligned Center Group' },
  render: createVariantsTemplate(gapOptions, 'gap'),
};

export const Grow: Story = {
  args: { children: 'Vertical Group', grow: true },
};
