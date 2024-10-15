import * as React from 'react';
import { css } from '@emotion/react';
import { List as MantineList, ListProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';

interface Props extends ListProps {
  readonly children?: React.ReactNode;
  readonly render?: () => React.ReactNode;
}

export const List: React.FC<Props> = observer(function List(props) {
  const { children, render, ...rest } = props;
  return (
    <MantineList
      css={styles.root}
      {...rest}
    >
      {render ? render() : (children ?? null)}
    </MantineList>
  );
});

const styles = {
  root: css`
    display: flex;
    flex-direction: column;
    gap: inherit;
    list-style-type: none;
  `,
};
