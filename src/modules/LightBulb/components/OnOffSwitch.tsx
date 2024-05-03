import React from 'react';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { Toggle } from 'common/components/Toggle';
import { Typography } from 'common/components/Typography';

interface Props extends DefaultProps {
  readonly getValue: () => boolean;
  readonly onChange: (value: boolean) => void;
}

const OnOffBase: React.FC<Props> = ({ className, getValue, onChange }) => {
  return (
    <Stack className={className!}>
      <Typography>Off</Typography>
      <Toggle
        getValue={getValue}
        onChange={onChange}
      />
      <Typography>On</Typography>
    </Stack>
  );
};

export const OnOffSwitch = styled(OnOffBase)(() => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
}));
