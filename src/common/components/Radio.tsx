import * as React from 'react';
import { css } from '@emotion/react';
import MuiRadio from '@mui/material/Radio';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly getValue: () => boolean;
  readonly onChange: () => void;
}

export const Radio: React.FC<Props> = observer(({ getValue, onChange }) => {
  return (
    <MuiRadio
      checked={getValue()}
      css={radioStyles.root}
      onChange={onChange}
    />
  );
});

const radioStyles = {
  root: css`
    /* background: green; */
  `,
};
