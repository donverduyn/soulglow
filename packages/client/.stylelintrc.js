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
    'declaration-empty-line-before': ['never'],
    'no-descending-specificity': null,
    'no-duplicate-selectors': true,
    'no-empty-source': null,
    'order/order': ['custom-properties', 'declarations', 'rules', 'at-rules'],
    'order/properties-alphabetical-order': true,
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['label'],
      },
    ],
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
    'selector-class-pattern': [
      '^([a-zA-Z0-9_-]+)$',
      {
        message: 'Selector should not contain special characters.',
        resolveNestedSelectors: true,
      },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['global'],
      },
    ],
    'selector-type-no-unknown': [
      true,
      {
        // TODO: use prefix from config
        ignoreTypes: ['from', '/^app/'],
      },
    ],
    'unit-no-unknown': [true, { severity: 'error' }],
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['font-family', 'label'],
      },
    ],
  },
  syntax: 'scss',
};
