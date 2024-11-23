import React from 'react';
import { Stack } from 'common/components/Stack/Stack';
import { Text } from 'common/components/Text/Text';
import { Toggle } from 'common/components/Toggle/Toggle';

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
      className={className ?? ''}
      // css={styles.root}
    >
      <Text>Off</Text>
      <Toggle
        getValue={getValue}
        name='on_off_switch'
        onChange={onChange}
      />
      <Text>On</Text>
    </Stack>
  );
};

// const styles = {
//   root: css`
//     align-items: center;
//     display: flex;
//     flex-direction: row;
//     justify-content: center;
//   `,
// };
