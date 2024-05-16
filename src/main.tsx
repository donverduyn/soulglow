// import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import './index.css';
import './config/console.ts';

//* this causes performance issues
// ClassNameGenerator.configure((componentName) =>
//   process.env.NODE_ENV === 'production' ? uuid().split('-')[0] : componentName
// );

const emotionCache = createCache({
  key: 'css',
  stylisPlugins: [],
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CacheProvider value={emotionCache}>
      <App />
    </CacheProvider>
  </React.StrictMode>
);
