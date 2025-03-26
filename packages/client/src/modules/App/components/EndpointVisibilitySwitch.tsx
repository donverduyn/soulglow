import { Stack } from 'common/components/Stack/Stack';
import { Toggle } from 'common/components/Toggle/Toggle';

interface Props {
  getValue: () => boolean;
  onChange: (value: boolean) => void;
}

export const EndpointVisibilitySwitch: React.FC<Props> = ({
  getValue,
  onChange,
}) => (
  <Stack>
    <Toggle
      getValue={getValue}
      name='endpoint_visibility'
      onChange={onChange}
    />
  </Stack>
);
