import * as React from 'react';
import {
  NumberInput as MantineNumberInput,
  NumberInputProps,
} from '@mantine/core';
import { useEventListener } from '@mantine/hooks';
import { observer } from 'mobx-react-lite';

interface Props extends Omit<NumberInputProps, 'onChange'> {
  readonly getValue: () => number;
  readonly onBlur?: () => void;
  readonly onChange: (value: number) => void;
}

export const NumberInput: React.FC<Props> = observer(
  ({ onBlur, getValue, onChange, ...rest }) => {
    const handleBlur = React.useCallback(() => onBlur && onBlur(), [onBlur]);
    // const handleWheel = React.useCallback<
    //   React.WheelEventHandler<HTMLInputElement>
    // >(
    //   (event) => {
    //     if (!event.deltaY) return;
    //     const adjustment = event.deltaY < 0 ? 0.1 : -0.1;
    //     onChange(Number((Number(getValue()) + adjustment).toFixed(1)));
    //     // event.preventDefault();
    //   },
    //   [onChange, getValue]
    // );

    const onChangeHandler = React.useCallback(
      (value: number | string) => {
        onChange(Number(value));
      },
      [onChange]
    );

    const onWheelHandler = React.useCallback((event: WheelEvent) => {
      if (document.activeElement === event.target) {
        event.stopPropagation();
      }
    }, []);

    const ref = useEventListener('wheel', onWheelHandler, { passive: true });

    return (
      <MantineNumberInput
        ref={ref}
        max={360}
        min={0}
        onBlur={handleBlur}
        onChange={onChangeHandler}
        size='md'
        value={getValue()}
        {...rest}
      />
    );
  }
);
