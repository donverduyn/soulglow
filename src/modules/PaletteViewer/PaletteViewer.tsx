import * as React from 'react';
import { css, type Theme } from '@mui/material/styles';
import { formatHex, type Okhsv } from 'culori';
import { observer } from 'mobx-react-lite';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';

interface Props {
  readonly getPalettes: () => Record<string, Okhsv[]>;
}

export const PaletteViewer: React.FC<Props> = observer((props) => {
  const palettes = Object.entries(props.getPalettes());

  return (
    <Paper
      css={styles.root}
      sx={styles.rootSx}
    >
      {palettes.map(([key, palette]) => (
        <Stack
          key={key}
          css={styles.palette}
        >
          {palette.map((color, id) => (
            <Stack
              key={key.concat(id.toString())}
              css={styles.swatch}
              style={{ backgroundColor: formatHex(color) }}
            >
              {formatHex(color)}
            </Stack>
          ))}
        </Stack>
      ))}
    </Paper>
  );
});

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
