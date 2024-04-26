import react from '@vitejs/plugin-react';
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
      babel: {
        plugins: [
          // [
          //   'babel-plugin-import',
          //   {
          //     libraryName: '@mui/material',
          //     libraryDirectory: '', // ensure this matches the MUI directory structure
          //     camel2DashComponentName: false,
          //   },
          //   'core',
          // ],
          // [
          //   'babel-plugin-import',
          //   {
          //     libraryName: '@mui/icons-material',
          //     libraryDirectory: '', // same for icons
          //     camel2DashComponentName: false,
          //   },
          //   'icons',
          // ],
          // [
          //   'babel-plugin-import',
          //   {
          //     libraryName: 'remeda',
          //     libraryDirectory: '',
          //     camel2DashComponentName: false,
          //   },
          //   'remeda',
          // ],
        ],
        // presets: [
        //   [
        //     '@babel/preset-env',
        //     {
        //       targets: 'defaults',
        //     },
        //   ],
        //   '@babel/preset-react',
        //   '@babel/preset-typescript',
        // ],
        // plugins: [
        //   [
        //     'babel-plugin-import',
        //     {
        //       libraryName: '@mui/material',
        //       libraryDirectory: '',
        //       camel2DashComponentName: false,
        //     },
        //   ],
        // ],
      },
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
      // projectRoot: process.cwd(),
      title: 'Vite Visualizer',
      filename: `./.analyzer/${createFileName('analysis')}.html`, // will be saved in project's root
    }),
    Inspect({
      build: true,
      outputDir: '.vite-inspect',
    }),
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
