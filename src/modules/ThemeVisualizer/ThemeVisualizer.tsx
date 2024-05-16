import { Theme, createTheme, css } from '@mui/material/styles';
import { isNumber } from 'remeda';
import { Paper } from 'common/components/Paper';
import { Stack } from 'common/components/Stack';
import { Typography } from 'common/components/Typography';

interface ThemeVisualizerProps extends DefaultProps {
  theme?: Theme;
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
              return (
                <Paper
                  key={key}
                  css={styles.color}
                  sx={{
                    backgroundColor: value as string,
                    color: theme.palette.getContrastText(value as string),
                  }}
                >
                  <Typography variant='body2'>{key}</Typography>
                  <Typography variant='body1'>{value}</Typography>
                </Paper>
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
  title: css`
    margin-bottom: 1rem;
  `,
};
