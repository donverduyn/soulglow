import * as React from 'react';
import { css } from '@emotion/react';
import {
  NumberInput as MantineNumberInput,
  NumberInputProps,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { prefix } from 'config/constants';

interface Props extends Omit<NumberInputProps, 'onChange'> {
  readonly getValue: () => number;
  readonly onBlur?: () => void;
  readonly onChange: (value: number) => void;
}

export const NumberInput: React.FC<Props> = observer(
  ({ onBlur, getValue, onChange, ...rest }) => {
    const handleBlur = React.useCallback(() => onBlur && onBlur(), [onBlur]);
    const handleWheel = React.useCallback<
      React.WheelEventHandler<HTMLInputElement>
    >(
      (event) => {
        if (!event.deltaY) return;
        const adjustment = event.deltaY < 0 ? 0.1 : -0.1;
        onChange(Number((Number(getValue()) + adjustment).toFixed(1)));
        // event.preventDefault();
      },
      [onChange, getValue]
    );

    return (
      <MantineNumberInput
        css={styles.root}
        max={360}
        min={0}
        onBlur={handleBlur}
        onWheel={handleWheel}
        size='md'
        value={getValue()}
        {...rest}
      />
    );
  }
);

const styles = {
  root: css`
    /* --input-padding-y: 1.33rem; */

    .${prefix}-NumberInput-input {
      background: transparent;
      border-width: 3px;
    }

    .${prefix}-NumberInput-control {
      background: transparent;
      border: 0;
    }
  `,
};
