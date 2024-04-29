import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import Inspect from 'vite-plugin-inspect';

const createFileName = (prefix: string) => {
  const now = new Date();
  return `${prefix}_${now
    .toISOString()
    .replace(/-|:|\./g, '')
    .replace('T', '')
    .slice(0, 14)}`;
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
    checker({
      overlay: true,
      terminal: false,
      root: process.cwd(),
      typescript: {
        tsconfigPath: './tsconfig.json',
      },
      eslint: {
        lintCommand: 'eslint ./src --ext .ts,.tsx',
        useFlatConfig: false,
        dev: { logLevel: ['error'] },
      },
    }),
    visualizer({
      template: 'treemap', // or sunburst
      gzipSize: true,
      brotliSize: true,
      // sourcemap: true,
      projectRoot: process.cwd(),
      title: 'Vite Visualizer',
      filename: `./.analyzer/${createFileName('analysis')}.html`, // will be saved in project's root
    }),
    Inspect(),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://192.168.0.153:80', // The base URL of your API
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    hmr: {
      overlay: true,
    },
  },
});
