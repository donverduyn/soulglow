import * as React from 'react';
import { Radio as MantineRadio, type RadioProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import styles from './Radio.module.css';

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
      classNames={styles}
      color='grey.0'
      name={name}
      onChange={onChange}
      size='md'
      {...rest}
    />
  );
});
