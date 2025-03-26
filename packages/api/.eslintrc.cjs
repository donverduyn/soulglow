const rulesDirPlugin = require('eslint-plugin-rulesdir');

rulesDirPlugin.RULES_DIR = __dirname + '/.eslint/rules';

module.exports = {
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:eslint-comments/recommended',
  ],
  ignorePatterns: [
    'node_modules',
    'dist',
    'dev-dist',
    '!**/.*',
    '!**/.*/**/.*',
  ],
  overrides: [
    {
      files: ['./**/*.{js,cjs,mjs}'],
      // config files are assumed to be running in node
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      env: { node: true },
    },
    // test environment
    {
      files: [
        '.*/**/*.test.{ts,tsx}',
        './tests/**/*.{ts,tsx}',
        './src/**/*.test.{ts,tsx}',
        './src/*.test-d.ts',
        'postcss.config.cjs',
        '**/*.ts',
      ],
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      env: { node: true },
      parserOptions: {
        ecmaVersion: 'latest',
        projectService: true,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
      },
      settings: {
        'import/resolver': {
          node: true,
          typescript: {
            alwaysTryTypes: true,
            project: ['./tsconfig.test.json'],
          },
        },
      },
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      extends: ['plugin:vitest/legacy-all'],
      rules: {
        'vitest/max-nested-describe': ['error', { max: 3 }],
        'vitest/no-hooks': 'off',
      },
    },
    // node environment
    {
      files: [
        './*.ts',
        // Maybe remove this if not needed
        './.*/**/*.ts',
        './scripts/**/*.ts',
        './types/**/*.ts',
      ],
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      env: { node: true },
      parserOptions: {
        ecmaVersion: 'latest',
        // include tsconfig.app.json for importing types from server
        projectService: true,
        sourceType: 'module',
        tsconfigRootDir: __dirname,
      },
      settings: {
        'import/resolver': {
          node: true,
          typescript: {
            alwaysTryTypes: true,
            project: ['./tsconfig.node.json'],
          },
        },
      },
    },
    {
      // all TypeScript files
      files: ['./**/*.ts'],
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      extends: [
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:import/typescript',
      ],
      plugins: ['@typescript-eslint', 'typescript-sort-keys'],
      rules: {
        // TODO: profile performance impact
        // 'import/namespace': 'off',
        // 'no-restricted-imports': [
        //   'error',
        //   {
        //     name: 'src/modules/MyModule/queries',
        //     message: 'GraphQL queries should only be imported in context.ts',
        //     allow: ['src/modules/MyModule/context.ts'],
        //   },
        // ],
        '@typescript-eslint/ban-ts-comment': [
          'warn',
          {
            'ts-check': false,
            'ts-expect-error': true,
            'ts-ignore': false,
            'ts-nocheck': false,
          },
        ],
        '@typescript-eslint/no-confusing-void-expression': [
          'warn',
          { ignoreArrowShorthand: true },
        ],
        '@typescript-eslint/no-empty-object-type': [
          'error',
          {
            allowInterfaces: 'always',
          },
        ],
        '@typescript-eslint/no-explicit-any': [
          'error',
          {
            ignoreRestArgs: true,
          },
        ],
        '@typescript-eslint/no-floating-promises': [
          'warn',
          { ignoreVoid: true },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unnecessary-condition': [
          'warn',
          { allowConstantLoopConditions: true },
        ],
        '@typescript-eslint/no-unnecessary-template-expression': 'warn',
        // TODO: see in the future if this can be enabled. Currently not beneficial.
        '@typescript-eslint/no-unnecessary-type-parameters': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'all',
            argsIgnorePattern: '^_$',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            ignoreRestSiblings: true,
            vars: 'local',
            varsIgnorePattern: '^_$',
          },
        ],
        '@typescript-eslint/unbound-method': 'off',
        'prefer-const': 'warn',
        'prefer-spread': 'off',
        'typescript-sort-keys/interface': 'warn',
        'typescript-sort-keys/string-enum': 'warn',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'unused-imports', 'sort-keys-fix', 'rulesdir'],
  // root: true,
  rules: {
    'eslint-comments/no-unused-disable': 'warn',
    'import/no-named-as-default-member': 'off',
    'import/order': [
      'warn',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'never',
        pathGroups: [
          {
            group: 'external',
            pattern: 'react',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
    'no-irregular-whitespace': 'off',
    'prettier/prettier': 'warn',
    'sort-keys': 'off',
    'sort-keys-fix/sort-keys-fix': [
      'warn',
      'asc',
      { caseSensitive: true, natural: false },
    ],
    'unused-imports/no-unused-imports': 'warn',
  },
};
