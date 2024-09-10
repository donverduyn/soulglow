import * as React from 'react';
import { css } from '@emotion/react';
import { observer } from 'mobx-react-lite';

interface Props {
  readonly children?: React.ReactNode;
  readonly render?: () => React.ReactNode;
}

export const List: React.FC<Props> = observer(({ children, render }) => {
  return (
    <ul css={listStyles.root}>{render ? render() : (children ?? null)}</ul>
  );
});

const listStyles = {
  root: css`
    display: flex;
    flex-direction: column;
    gap: inherit;
    list-style-type: none;
    margin: 0;
    padding: 0;
  `,
};
