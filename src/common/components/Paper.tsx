import MuiPaper from '@mui/material/Paper';
import { observer } from 'mobx-react-lite';

interface Props extends DefaultProps {
  readonly children: React.ReactNode;
  readonly getStyle?: () => React.CSSProperties;
}

const PaperBase: React.FC<Props> = ({ className, getStyle, children }) => {
  return (
    <MuiPaper
      className={className!}
      style={getStyle ? getStyle() : {}}
    >
      {children}
    </MuiPaper>
  );
};

export const Paper = observer(PaperBase);
