import * as React from 'react';
import { css } from '@emotion/react';

interface Props {
  readonly children: React.ReactNode;
}

export const List: React.FC<Props> = ({ children }) => {
  return <ul css={listStyles.root}>{children}</ul>;
};

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
