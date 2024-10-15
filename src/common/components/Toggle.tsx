import * as React from 'react';
import { css } from '@emotion/react';
import { Switch, type SwitchProps } from '@mantine/core';
import { observer } from 'mobx-react-lite';

interface Props extends Omit<SwitchProps, 'onChange'> {
  readonly getValue: () => boolean;
  readonly name: string;
  readonly onChange: (value: boolean) => void;
}

export const Toggle: React.FC<Props> = observer(function Toggle(props) {
  const { className, getValue, onChange, name, ...rest } = props;
  //
  const handleChange = React.useCallback<
    (e: React.ChangeEvent<HTMLInputElement>) => void
  >((e) => onChange(e.target.checked), [onChange]);

  return (
    <Switch
      checked={getValue()}
      className={className!}
      color='dark.1'
      css={styles.root}
      name={name}
      onChange={handleChange}
      size='sm'
      {...rest}
    />
  );
});

const styles = {
  root: css``,
};
