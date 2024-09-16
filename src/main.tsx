// import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { configure } from 'mobx';
import ReactDOM from 'react-dom/client';
import { client } from './__generated/api';
import { App } from './modules/App/App.tsx';
import './index.css';
import './config/console.ts';

//* this causes performance issues
// ClassNameGenerator.configure((componentName) =>
//   process.env.NODE_ENV === 'production' ? uuid().split('-')[0] : componentName
// );

client.setConfig({
  baseUrl: '/api',
});

configure({ computedRequiresReaction: true, enforceActions: 'always' });
// enableStaticRendering(true)

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
