import * as React from 'react';
import { css } from '@mui/material/styles';
import { formatHex, type Lch } from 'culori';
import { observer } from 'mobx-react-lite';
import { Paper } from 'common/components/Paper';

interface Props {
  readonly getPalettes: () => Record<string, Lch[]>;
}

const paletteViewerCss = {
  palette: css`
    background: none;
    box-shadow: none;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.5em;
  `,
  root: css`
    background: white;
    display: flex;
    flex: 1;
    flex-direction: row;
    gap: 0.5em;
    padding: 0.5em;
  `,
  swatch: css`
    color: white;
    flex: 1;
    padding: 0.25em;
  `,
};

const PaletteViewerBase: React.FC<Props> = ({ getPalettes }) => {
  const palettes = getPalettes();
  return (
    <Paper css={paletteViewerCss.root}>
      {Object.entries(palettes).map(([key, palette]) => (
        <Paper
          key={key}
          css={paletteViewerCss.palette}
        >
          {palette.map((color, id) => (
            <Paper
              key={key.concat(id.toString())}
              css={paletteViewerCss.swatch}
              getStyle={() => {
                return { backgroundColor: formatHex(color) };
              }}
            >
              {formatHex(color)}
            </Paper>
          ))}
        </Paper>
      ))}
    </Paper>
  );
};

export const PaletteViewer = observer(PaletteViewerBase);
