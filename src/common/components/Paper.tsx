import { useTheme, type Theme } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
  readonly getStyle?: (theme: Theme) => React.CSSProperties;
}

export const Paper: React.FC<Props> = observer(function Paper(props) {
  const { children, className, getStyle } = props;
  const theme = useTheme();
  return (
    <div
      className={className}
      style={getStyle ? getStyle(theme) : undefined}
    >
      {children}
    </div>
  );
});
