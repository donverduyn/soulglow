import * as React from 'react';
import { Theme, createTheme, css } from '@mui/material/styles';
import moize from 'moize';
import { isNumber } from 'remeda';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { Typography } from 'common/components/Typography';

interface ThemeVisualizerProps extends DefaultProps {
  readonly theme?: Theme;
}

export const ThemeVisualizer: React.FC<ThemeVisualizerProps> = ({
  className,
  theme = createTheme({}),
}) => {
  const items = [
    'action',
    'background',
    'common',
    'error',
    'primary',
    'secondary',
    'info',
    'success',
    'warning',
    'grey',
  ] as const;

  return (
    <Paper
      className={className}
      css={styles.root}
      getStyle={styles.rootSx}
    >
      <Typography
        css={styles.title}
        variant='h4'
      >
        Theme Visualizer
      </Typography>
      {items.map((item) => (
        <Stack
          key={item}
          css={styles.item}
        >
          <Typography
            css={styles.name}
            variant='h6'
          >
            {item}
          </Typography>
          {Object.entries(theme.palette[item as keyof Theme['palette']]).map(
            ([key, value]) => {
              const isColor = !isNumber(value);
              if (!isColor) return null;

              // TODO: does this clean up on rerender and stay in sync with value?
              const getStyle = moize(() => ({
                backgroundColor: value as string,
                color: theme.palette.getContrastText(value as string),
              }));
              return (
                <Stack
                  key={key}
                  css={styles.color}
                  getStyle={getStyle}
                >
                  <Typography variant='body2'>{key}</Typography>
                  <Typography variant='body1'>{value}</Typography>
                </Stack>
              );
            }
          )}
        </Stack>
      ))}
    </Paper>
  );
};

const styles = {
  color: css`
    border-radius: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
  `,
  item: css`
    display: flex;
    flex-flow: row wrap;
    margin-bottom: 1rem;
    overflow: hidden;
  `,
  name: css`
    align-self: center;
    flex-basis: 7em;
    text-align: left;
  `,
  root: css`
    padding: 2rem;
  `,
  rootSx: (theme: Theme) => ({
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius.toString() + 'px',
  }),
  title: css`
    margin-bottom: 1rem;
  `,
};
