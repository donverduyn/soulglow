import * as React from 'react';
import cy from 'clsx';
import {
  convertOkhsvToOklab,
  convertOklabToRgb,
  serializeHex,
  type Okhsv,
} from 'culori/fn';
import { flow } from 'effect';
import { computed, untracked } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Group } from 'common/components/Group/Group';
import { Paper } from 'common/components/Paper/Paper';
import { Stack } from 'common/components/Stack/Stack';
import { createPalettes } from 'common/utils/color';
import styles from './PaletteViewer.module.css';

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
    <Stack className={cy(className, styles.PaletteViewer)}>
      {entries.map(([key, palette]) => (
        <Group
          key={key}
          className={styles.Palette}
        >
          {palette.map((_, i) => {
            const color = computed(() => formatHex(palettes.get()[key][i]));
            return (
              <Paper
                key={key.concat(i.toString())}
                className={styles.Swatch}
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
