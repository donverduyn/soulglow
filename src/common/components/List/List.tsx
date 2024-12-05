import * as React from 'react';
// import { css } from '@emotion/react';
import { List as MantineList, ListProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import styles from './List.module.css';

interface Props extends ListProps {
  readonly children?: React.ReactNode;
  readonly render?: () => React.ReactNode;
}

/**
 * This component supports a render prop to allow late dereferenced Mobx proxies.
 * Whenever a list its contents changes this way,
 * it only causes the list to rerender, not the parent component.
 */

export const List: React.FC<Props> = observer(function List(props) {
  const { children, render, ...rest } = props;
  return (
    <MantineList
      className={styles.List}
      {...rest}
    >
      {render ? render() : (children ?? null)}
    </MantineList>
  );
});
