import * as React from 'react';
import { Switch } from '@mui/material';
import { observer } from 'mobx-react-lite';

interface Props {
  readonly getValue: () => boolean;
  readonly onChange: (value: boolean) => void;
}

export const Toggle: React.FC<Props> = observer(({ getValue, onChange }) => {
  //
  const handleChange = React.useCallback<
    (e: React.ChangeEvent<HTMLInputElement>, v: boolean) => void
  >((_, v) => onChange(v), [onChange]);

  return (
    <Switch
      checked={getValue()}
      inputProps={{ 'aria-label': 'controlled' }}
      onChange={handleChange}
    />
  );
});
