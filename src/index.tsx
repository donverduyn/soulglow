import * as React from 'react';
import createCache from '@emotion/cache';
import { configure } from 'mobx';
import './config/console.ts';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { isDevelopment, prefix } from 'config/constants';
import { getEmotionCacheConfig } from 'config/emotion.js';
import { mobxConfig } from 'config/mobx.js';
import { theme } from 'config/theme';
import { initializeI18N } from 'i18n';
import { client } from './__generated/api/index.ts';
import App from './modules/App/App.tsx';
import '@mantine/core/styles.css';
import './index.css';
import './font.css';

const i18n = initializeI18N();
client.setConfig({ baseUrl: '/api' });

// TODO: think about how we can share this with storybook
configure(mobxConfig);
// enableStaticRendering(true)

const emotionCache = createCache(getEmotionCacheConfig(prefix));
if (isDevelopment) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error not defined
  globalThis.EMOTION_RUNTIME_AUTO_LABEL = true;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider
      emotionCache={emotionCache}
      prefix={prefix}
      theme={theme}
    >
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
