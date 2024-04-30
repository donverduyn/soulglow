import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { checker } from 'vite-plugin-checker';
import inspect from 'vite-plugin-inspect';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

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
    tsconfigPaths(),
    react({
      jsxImportSource: '@emotion/react',
      plugins: [['@swc/plugin-emotion', {}]],
    }),
    checker({
      overlay: {
        initialIsOpen: false,
        panelStyle: 'height: 50vh;',
        badgeStyle: 'background-color: transparent; font-size: 0.75em;',
      },
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
    inspect(),
  ],
  test: {
    // logHeapUsage: true,
    open: true,
    // resolveSnapshotPath: (testPath, snapshotExtension) =>
    //   testPath.replace(/\.test\.(ts|tsx)$/, `.snap${snapshotExtension}`),
    // typecheck: {
    //   checker: 'tsc',
    //   tsconfig: './tsconfig.json',
    //   enabled: true,
    // },
    // reporters: ['html'],
    globals: true,
    environment: 'happy-dom',
  },
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
