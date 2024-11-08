import * as React from 'react';
// import { css } from '@emotion/react';
import {
  TextInput as MantineTextInput,
  type TextInputProps,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useReaction } from 'common/hooks/useMobx';
import { prefix } from 'config/constants';

interface Props extends Omit<TextInputProps, 'onChange'> {
  readonly getValue: () => string;
  readonly onChange: (value: string) => void;
}

export const TextInput: React.FC<Props> = observer(function TextField(props) {
  const { className, getValue, onChange, ...rest } = props;
  const value = getValue();
  const cursorRef = React.useRef({ end: 0, start: 0 });
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [optimistic, setOptimistic] = React.useState<string>(value || '');

  useReaction(getValue, (value) => {
    const cursor = cursorRef.current;
    inputRef.current?.setSelectionRange(cursor.start, cursor.end);
    if (value !== optimistic) setOptimistic(value);
  });

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { end, start, value } = getCursorAndValue(e);
      cursorRef.current.end = end;
      cursorRef.current.start = start;

      const newValue = normalizeMacOSDot(
        (e.nativeEvent as { data?: string }).data ?? '',
        value,
        start
      );
      setOptimistic(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  // TODO: fix bug where the same single character being selected, prevents it from being replaced by the new same character being typed.
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') return;
      const { end, start, value } = getCursorAndValue(e);

      let newValue;
      if (e.key.length === 1) {
        newValue =
          value.slice(0, start) +
          e.key +
          value.slice(start !== end ? end : start);
        cursorRef.current.end = start + 1;
        cursorRef.current.start = start + 1;
      } else if (e.key === 'Backspace' && start !== end) {
        newValue = value.slice(0, start) + value.slice(end);
        cursorRef.current.start = start;
        cursorRef.current.end = start;
      }

      if (newValue !== undefined) {
        setOptimistic(newValue);
        onChange(newValue);
        e.preventDefault();
      }
    },
    [onChange]
  );

  return (
    <MantineTextInput
      ref={inputRef}
      autoComplete='off'
      autoCorrect='off'
      className={className ?? ''}
      // css={styles.root}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      size='md'
      spellCheck='false'
      value={optimistic}
      {...rest}
    />
  );
});

function normalizeMacOSDot(data: string, val: string, cursor: number) {
  if (data === '. ') {
    const first = val.slice(0, cursor - 2);
    const last = val.slice(Math.min(cursor, val.length), val.length);
    return `${first}  ${last}`;
  }
  return val;
}

function getCursorAndValue(e: {
  currentTarget: {
    selectionEnd: number | null;
    selectionStart: number | null;
    value: string;
  };
}) {
  const value = e.currentTarget.value;
  const start = e.currentTarget.selectionStart || 0;
  const end = e.currentTarget.selectionEnd || 0;
  return { end, start, value };
}

// const styles = {
//   input: css`
//     &:hover {
//       background: inherit;
//     }
//   `,
//   root: css`
//     --input-padding-y: 1.33rem;

//     .${prefix}-TextInput-input {
//       background-color: transparent;
//       border-width: 3px;
//     }
//   `,
// };
