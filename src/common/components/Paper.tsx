import { useTheme, type Theme } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
  readonly getStyle?: (theme: Theme) => React.CSSProperties;
}

export const Paper: React.FC<Props> = observer(
  ({ className, getStyle, children }) => {
    const theme = useTheme();
    return (
      <div
        className={className}
        style={getStyle ? getStyle(theme) : {}}
      >
        {children}
      </div>
    );
  }
);
