import * as React from 'react';
// import { css } from '@emotion/react';
import {
  convertOkhsvToOklab,
  convertOklabToRgb,
  serializeHex,
  type Okhsv,
} from 'culori/fn';
import { flow } from 'effect';
import { computed, untracked } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Group } from 'common/components/Group';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { createPalettes } from 'common/utils/color';

interface Props extends DefaultProps {
  readonly getColor: () => Okhsv;
}

const Main: React.FC<Props> = observer(PaletteViewer);
// TODO: consider importing from utils
const formatHex = flow(convertOkhsvToOklab, convertOklabToRgb, serializeHex);

export default Main;
function PaletteViewer({ getColor, className }: Props) {
  // we don't need useMemo here because props are stable
  const palettes = computed(() => createPalettes(getColor()));
  // prevent reconciliation on every update
  const entries = Object.entries(untracked(() => palettes.get()));
  return (
    <Stack
      className={className ?? ''}
      // css={styles.root}
    >
      {entries.map(([key, palette]) => (
        <Group
          key={key}
          // css={styles.palette}
        >
          {palette.map((_, i) => {
            const color = computed(() => formatHex(palettes.get()[key][i]));
            return (
              <Paper
                key={key.concat(i.toString())}
                // css={styles.swatch}
                //* color cannot be stable across renders
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                render={() => color.get()}
                // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop
                getStyle={() => ({
                  background: color.get(),
                })}
              />
            );
          })}
        </Group>
      ))}
    </Stack>
  );
}

// const styles = {
//   palette: css`
//     label: Palette;
//   `,
//   root: css`
//     border-radius: var(--mantine-radius-md);
//   `,
//   swatch: css`
//     color: var(--mantine-color-white);
//     flex: 1;
//     label: Swatch;
//     padding: 0.25em;
//     text-align: center;
//     transition: background-color 0.17s ease;
//   `,
// };
