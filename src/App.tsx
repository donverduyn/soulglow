import './App.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LightBulb from './modules/LightBulb/LightBulb';

const darkTheme = createTheme({
  palette: { mode: 'dark' },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className='App'>
        <header className='App-header'>
          <LightBulb />
        </header>
      </div>
    </ThemeProvider>
  );
}
