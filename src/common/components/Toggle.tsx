import * as React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { observer } from 'mobx-react-lite';

interface Props {
  readonly getValue: () => boolean;
  readonly onChange: (value: boolean) => void;
}

const ToggleBase: React.FC<Props> = observer(({ getValue, onChange }) => {
  //
  const handleChange = React.useCallback<
    (e: React.ChangeEvent<HTMLInputElement>, v: boolean) => void
  >((_, v) => onChange(v), [onChange]);

  return (
    <Switch
      checked={getValue()}
      color='primary'
      inputProps={{ 'aria-label': 'controlled' }}
      onChange={handleChange}
    />
  );
});

export const Toggle = styled(ToggleBase)`
  background: inherit;
`;
