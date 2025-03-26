import { ActionIcon, ActionIconProps, type ElementProps } from '@mantine/core';
import styles from './IconButton.module.css';

interface Props
  extends ActionIconProps,
    ElementProps<'button', keyof ActionIconProps> {}

export const IconButton: React.FC<Props> = (props) => {
  return (
    <ActionIcon
      className={styles.IconButton}
      size='xl'
      {...props}
    />
  );
};
