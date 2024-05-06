import './App.css';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme, css } from '@mui/material/styles';
import LightBulb from './modules/LightBulb/LightBulb';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ffffff' },
    secondary: { main: '#b3b3b3' },
  },
});

// const cardCss = {
//   self: css({
//     backgroundColor: 'white',
//     border: '1px solid #eee',
//     borderRadius: '0.5rem',
//     padding: '1rem'
//   }),


export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className='App'>
        {/* <header className='App-header'>
         
        </header> */}
        <LightBulb />
      </div>
    </ThemeProvider>
  );
}
