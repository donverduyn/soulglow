module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'unused-imports'],
  rules: {
    'prettier/prettier': 'warn',
    'no-irregular-whitespace': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'import/no-named-as-default-member': 'off',
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  overrides: [
    {
      // config files are assumed to be running in node
      files: ['./**/*.js', './**/*.cjs', './**/*.mjs'],
      env: { node: true },
    },
    {
      // all TypeScript files
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // tsconfig.node.json only applies for vite.config.ts
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:import/typescript',
      ],
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: ['./tsconfig.json', './tsconfig.node.json'],
          },
        },
      },
      rules: {
        '@typescript-eslint/no-unnecessary-condition': 'warn',
        '@typescript-eslint/no-useless-template-literals': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-floating-promises': [
          'warn',
          { ignoreVoid: true },
        ],
        // support this to use with mobx api
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-confusing-void-expression': [
          'warn',
          { ignoreArrowShorthand: true },
        ],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            varsIgnorePattern: '^_$',
            argsIgnorePattern: '^_$',
            vars: 'local',
            args: 'all',
            ignoreRestSiblings: true,
          },
        ],

        '@typescript-eslint/no-empty-interface': [
          'error',
          {
            allowSingleExtends: true,
          },
        ],
      },
    },
    {
      // all TypeScript files in src
      files: ['./src/**/*.ts', './src/**/*.tsx'],
      env: { browser: true },
    },
    {
      // all test files
      files: [
        './tests/**/*.ts',
        './tests/**/*.tsx',
        './src/**/*.test.ts',
        './src/**/*.test.tsx',
      ],
      extends: ['plugin:vitest/legacy-all'],
      rules: {
        'vitest/max-nested-describe': ['error', { max: 3 }],
        'vitest/no-hooks': 'off',
      },
    },
    {
      // all React files
      files: ['./src/**/*.tsx'],
      settings: { react: { version: 'detect' } },
      plugins: ['react', 'react-hooks', 'react-refresh'],
      extends: [
        'plugin:react/jsx-runtime',
        'plugin:react/all',
        'plugin:react-hooks/recommended',
      ],
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
        'no-restricted-imports': [
          'error',
          {
            patterns: ['@mui/*/*/*'],
          },
        ],
        'react/jsx-curly-spacing': 'warn',
        'react/prop-types': 'off',
        'react/jsx-no-useless-fragment': 'warn',
        'react/no-unused-prop-types': 'warn',
        'react/jsx-no-comment-textnodes': 'warn',
        'react/jsx-curly-brace-presence': 'warn',
        'react/jsx-props-no-multi-spaces': 'warn',
        'react/jsx-handler-names': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/forbid-component-props': 'off',
        'react/require-default-props': 'off',
        'react/jsx-no-literals': 'off',
        'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
        'react/jsx-indent-props': ['warn', 2],
        'react/jsx-indent': ['warn', 2],
        'react/jsx-max-depth': ['warn', { max: 3 }],
        'react/jsx-wrap-multilines': 'off',
        'react/jsx-closing-bracket-location': ['warn', 'line-aligned'],
        'react/jsx-child-element-spacing': 'off',
        'react/destructuring-assignment': [
          'warn',
          'always',
          { ignoreClassFields: true, destructureInSignature: 'always' },
        ],
        'react/function-component-definition': [
          'warn',
          {
            namedComponents: ['function-declaration', 'arrow-function'],
            unnamedComponents: ['arrow-function'],
          },
        ],
        'react/jsx-max-props-per-line': [
          'warn',
          { maximum: { single: 3, multi: 1 } },
        ],
        'react/jsx-newline': [
          'warn',
          { prevent: true, allowMultilines: false },
        ],
        'react/jsx-sort-props': [
          'warn',
          {
            callbacksLast: true,
            shorthandFirst: true,
            ignoreCase: true,
            reservedFirst: true,
            multiline: 'last',
          },
        ],
        'react/jsx-one-expression-per-line': [
          'warn',
          { allow: 'single-child' },
        ],
        'react/jsx-closing-tag-location': 'off',
        'react/jsx-filename-extension': [
          'error',
          { allow: 'as-needed', extensions: ['.tsx'] },
        ],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
};
