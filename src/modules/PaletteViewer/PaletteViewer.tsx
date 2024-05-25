import * as React from 'react';
import { css, type Theme } from '@mui/material/styles';
import { formatHex, type Okhsv } from 'culori';
import { computed, untracked } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { createPalettes } from 'theme';

interface Props {
  readonly getColor: () => Okhsv;
}

const PaletteViewerComponent: React.FC<Props> = ({ getColor }) => {
  const palettes = computed(() => createPalettes(getColor()));
  const entries = Object.entries(untracked(() => palettes.get()));
  return (
    <Paper
      css={styles.root}
      getStyle={styles.rootSx}
    >
      {entries.map(([key, palette]) => (
        <Stack
          key={key}
          css={styles.palette}
        >
          {palette.map((_, i) => {
            const color = computed(() => formatHex(palettes.get()[key][i]));
            return (
              <Stack
                key={key.concat(i.toString())}
                css={styles.swatch}
                getStyle={() => ({ background: color.get() })}
                render={() => color.get()}
              />
            );
          })}
        </Stack>
      ))}
    </Paper>
  );
};

export const PaletteViewer = observer(PaletteViewerComponent);
const styles = {
  palette: css`
    background: none;
    box-shadow: none;
    display: flex;
    flex: 1;
    flex-direction: row;
    gap: 0.5em;
  `,
  root: css`
    background: none;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.5em;
    overflow: hidden;
  `,
  rootSx: (theme: Theme) => ({
    borderRadius: theme.shape.borderRadius.toString() + 'px',
  }),
  swatch: css`
    align-items: center;
    color: white;
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: center;
    padding: 0.25em;
  `,
};
