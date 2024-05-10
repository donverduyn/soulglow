import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { LightBulb } from 'modules/LightBulb/LightBulb';
import { darkTheme, lightTheme } from './theme';

const AppBase = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <div className='App'>
        {/* <header className='App-header'>
         
        </header> */}
        <LightBulb />
        {/* <ThemeVisualizer theme={prefersDarkMode ? darkTheme : lightTheme} /> */}
      </div>
    </ThemeProvider>
  );
};

export const App = styled(AppBase)({});
