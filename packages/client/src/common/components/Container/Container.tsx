import type { ContainerProps } from '@mantine/core';
import { Container as MantineContainer } from '@mantine/core';
import { observer } from 'mobx-react-lite';

interface Props extends ContainerProps {}

export const Container: React.FC<Props> = observer(function Container(props) {
  return <MantineContainer {...props} />;
});
