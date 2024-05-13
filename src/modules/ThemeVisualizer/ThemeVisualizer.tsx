import { Theme, createTheme, styled } from '@mui/material/styles';
import { isNumber } from 'remeda';
import { Typography } from 'common/components/Typography';

interface ThemeVisualizerProps extends DefaultProps {
  theme?: Theme;
}

const ThemeVisualizerBase: React.FC<ThemeVisualizerProps> = ({
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
    <div className={className}>
      <Typography
        className='title'
        variant='h4'
      >
        Theme Visualizer
      </Typography>
      {items.map((item) => {
        return (
          <div
            key={item}
            className='item'
          >
            <Typography
              className='name'
              variant='h6'
            >
              {item}
            </Typography>
            {Object.entries(theme.palette[item as keyof Theme['palette']]).map(
              ([key, value]) => {
                const isColor = !isNumber(value);
                if (!isColor) return null;
                return (
                  <div
                    key={key}
                    className='color'
                    style={{
                      backgroundColor: value as string,
                      color: theme.palette.getContrastText(value as string),
                    }}
                  >
                    <Typography variant='body2'>{key}</Typography>
                    <Typography variant='body1'>{value}</Typography>
                  </div>
                );
              }
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ThemeVisualizer = styled(ThemeVisualizerBase, {
  shouldForwardProp: (prop) => prop === 'theme',
})`
  background-color: ${({ theme }) => theme.palette.background.paper};
  padding: 2rem;

  & .title {
    margin-bottom: 1rem;
  }

  & .item {
    display: flex;
    flex-wrap: wrap;
    /* gap: 1rem; */
    margin-bottom: 1rem;

    & .name {
      align-self: center;
      flex-basis: 7em;
      text-align: left;
    }
  }

  & .color {
    display: flex;
    flex: 1;
    flex-direction: column;
    /* gap: 0.5rem; */
  }
`;
