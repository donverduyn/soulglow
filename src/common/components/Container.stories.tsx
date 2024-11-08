import { Text, Title } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorSchemeDecorator } from '.storybook/decorators/ColorSchemeDecorator';
import { ThemeDecorator } from '.storybook/decorators/ThemeDecorator';
import { Container } from './Container';

const TitleTemplate = Title.withProps({ mr: 'md', order: 1 });
const createContainerTemplate = (fixtures: {
  readonly content: string | undefined;
  readonly title: string | undefined;
}) =>
  // eslint-disable-next-line react/function-component-definition
  function ContainerTemplate(props: React.ComponentProps<typeof Container>) {
    return (
      <Container {...props}>
        <TitleTemplate>{fixtures.title}</TitleTemplate>
        <Text>{fixtures.content}</Text>
      </Container>
    );
  };

const content = `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
`;

const meta: Meta<typeof Container> = {
  args: { bd: '1px solid gray' },
  component: Container,
  decorators: [
    ColorSchemeDecorator,
    ThemeDecorator({ defaultColorScheme: 'dark' }),
  ],
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  title: 'Common/Container',
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  // globals: { backgrounds: { disabled: true } },
  render: createContainerTemplate({ content, title: 'Default Container' }),
};

export const Padded: Story = {
  args: { p: 'xl' },
  render: createContainerTemplate({ content, title: 'Padded Container' }),
};

export const Sized: Story = {
  args: { size: 'xs' },
  render: createContainerTemplate({ content, title: 'Sized Container' }),
};
