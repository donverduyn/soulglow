import * as React from 'react';
import { configure } from 'mobx';
import './config/console.ts';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'common/providers/ThemeProvider';
import { prefix } from 'config/constants';
import { mobxConfig } from 'config/mobx.js';
import { theme } from 'config/theme';
import { initializeI18N } from 'i18n';
import { client } from './__generated/api';
import '@mantine/core/styles.layer.css';
import App from './modules/App/App.tsx';
import './index.css';
import './font.css';

const i18n = initializeI18N();
client.setConfig({ baseUrl: '/api' });

// TODO: think about how we can share this with storybook
configure(mobxConfig);
// enableStaticRendering(true)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider
      prefix={prefix}
      theme={theme}
    >
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
