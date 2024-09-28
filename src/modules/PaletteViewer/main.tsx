import * as React from 'react';
import { css, type Theme } from '@mui/material/styles';
import { formatHex, type Okhsv } from 'culori';
import { computed, untracked } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { createPalettes } from 'common/utils/color';

interface Props extends DefaultProps {
  readonly getColor: () => Okhsv;
}

const Main: React.FC<Props> = observer(PaletteViewer);

export default Main;
function PaletteViewer({ getColor, className }: Props) {
  // we don't need useMemo here because props are stable
  const palettes = computed(() => createPalettes(getColor()));
  // prevent reconciliation on every update
  const entries = Object.entries(untracked(() => palettes.get()));
  return (
    <Paper
      className={className}
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
        </Stack>
      ))}
    </Paper>
  );
}

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
  //TODO: currently cannot return pseudo selectors from getStyle a la `&:hover`, this would be nice so that we can safely borrow the sx name from MUI
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
    transition: background-color 0.17s ease;
  `,
};
