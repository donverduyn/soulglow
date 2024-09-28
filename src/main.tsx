import * as React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { configure } from 'mobx';
import './index.css';
import './config/console.ts';
import ReactDOM from 'react-dom/client';
import { client } from './__generated/api';
import App from './modules/App/main';

// const getComponentName = moize((componentName: string) =>
//   process.env.NODE_ENV === 'production' ? 'css' : componentName
// );

//ClassNameGenerator.configure(getComponentName);
// //* this causes performance issues

// TODO: only in development
// @ts-expect-error not defined
globalThis.EMOTION_RUNTIME_AUTO_LABEL = true;

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
