/** @type {import('stylelint').Config} */
export default {
  defaultSeverity: 'warning',
  extends: ['stylelint-config-standard', 'stylelint-config-recommended'],
  ignorePatterns: ['dist', 'node_modules', !'*.tsx', !'*.css'],
  overrides: [
    {
      customSyntax: 'postcss-styled-syntax',
      files: ['**/*.{js,ts,jsx,tsx}'],
    },
  ],
  plugins: ['stylelint-order'],
  rules: {
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'comment-empty-line-before': [
      'never',
      {
        ignore: ['stylelint-commands', 'after-comment'],
      },
    ],
    'no-descending-specificity': null,
    'no-duplicate-selectors': true,
    "declaration-empty-line-before": ["never"],
    'order/order': ['custom-properties', 'declarations', 'rules', 'at-rules'],
    'order/properties-alphabetical-order': true,
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'selector-class-pattern': [
      '^(Mui.*|[a-z0-9_-]+)$',
      {
        message:
          'Selector should be written in lowercase with hyphens (except MUI classes)',
        resolveNestedSelectors: true,
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['global'],
      },
    ],
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['font-family', '--label'],
      },
    ],
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['from', '/^Mui/'], // Ignoring MUI-specific types
      },
    ],
    'unit-no-unknown': [true, { severity: 'error'}],
  },
  syntax: 'scss',
};
