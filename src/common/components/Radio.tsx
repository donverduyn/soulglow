import * as React from 'react';
// import { css } from '@emotion/react';
import { Radio as MantineRadio, type RadioProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { prefix } from 'config/constants';

interface Props extends RadioProps {
  readonly getValue: () => boolean;
  readonly name: string;
  readonly onChange: () => void;
}

export const Radio: React.FC<Props> = observer(function Radio(props) {
  const { getValue, onChange, name, ...rest } = props;
  return (
    <MantineRadio
      checked={getValue()}
      color='grey.0'
      // css={radioStyles.root}
      name={name}
      onChange={onChange}
      size='md'
      {...rest}
    />
  );
});

// const radioStyles = {
//   root: css`
//     /* background: green; */
//     .${prefix}-Radio-radio {
//       border-width: 3px;
//     }
//   `,
// };
