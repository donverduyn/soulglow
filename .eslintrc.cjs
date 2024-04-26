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
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/no-named-as-default-member': 'off',
    'import/order': ['warn', { alphabetize: { order: 'asc' } }],
  },
  overrides: [
    {
      // config files are assumed to be running in node
      files: ['./**/*.js', './**/*.cjs', './**/*.mjs'],
      env: { node: true },
    },
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
      ],
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: ['./tsconfig.json'],
          },
        },
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { varsIgnorePattern: '^_$' },
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
      files: ['./src/**/*.ts', './src/**/*.tsx'],
      env: { browser: true },
    },
    {
      files: ['./src/**/*.tsx'],
      settings: { react: { version: 'detect' } },
      plugins: ['react', 'react-hooks'],
      extends: ['plugin:react/all', 'plugin:react-hooks/recommended'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: ['@mui/*/*/*'],
          },
        ],
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
