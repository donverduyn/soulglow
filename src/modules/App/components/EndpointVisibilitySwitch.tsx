import { css } from '@emotion/react';
import { Stack } from 'common/components/Stack';
import { Toggle } from 'common/components/Toggle';

interface Props {
  getValue: () => boolean;
  onChange: (value: boolean) => void;
}

export const EndpointVisibilitySwitch: React.FC<Props> = ({
  getValue,
  onChange,
}) => (
  <Stack 
    // css={styles.root}
  >
    <Toggle
      getValue={getValue}
      name='endpoint_visibility'
      onChange={onChange}
    />
  </Stack>
);

// this allows emotion to use the component name
// const styles = {
//   root: css``,
// };
