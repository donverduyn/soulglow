// import { css } from '@emotion/react';
import { Group as MantineGroup, GroupProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';

interface Props extends GroupProps {}

export const Group: React.FC<Props> = observer(function Group(props) {
  const { children, ...rest } = props;
  return <MantineGroup {...rest}>{children}</MantineGroup>;
});
