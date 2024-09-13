import React from 'react';
import { css } from '@mui/material/styles';
import { Stack } from 'common/components/Stack';
import { Toggle } from 'common/components/Toggle';
import { Typography } from 'common/components/Typography';

interface Props extends DefaultProps {
  readonly getValue: () => boolean;
  readonly onChange: (value: boolean) => void;
}

export const OnOffSwitch: React.FC<Props> = ({
  className,
  getValue,
  onChange,
}) => {
  return (
    <Stack
      className={className}
      css={styles.root}
    >
      <Typography>Off</Typography>
      <Toggle
        getValue={getValue}
        name='on_off_switch'
        onChange={onChange}
      />
      <Typography>On</Typography>
    </Stack>
  );
};

const styles = {
  root: css`
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
  `,
};
