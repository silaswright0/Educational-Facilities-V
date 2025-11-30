// Charcoal Frontend ESLint (React + TS) — CRA 5 compatible
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true, jest: true },
  parserOptions: { ecmaVersion: 2021, sourceType: 'module', ecmaFeatures: { jsx: true } },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {

    'jsx-a11y/label-has-associated-control': ['error', {
      assert: 'either',   // accept nesting OR htmlFor/id
      depth: 3            // optional: how deep to search for nested controls (default 2)
    }],

    // Formatting per Charcoal
    indent: ['error', 2, { SwitchCase: 1 }],
    'max-len': ['error', { code: 100, tabWidth: 2, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
    'eol-last': ['error', 'always'],
    'no-trailing-spaces': 'error',

    // Naming / Components
    camelcase: ['error', { properties: 'never', ignoreDestructuring: false }],
    'react/jsx-pascal-case': ['error', { allowAllCaps: true }],

    // Vars
    'no-var': 'error',
    'prefer-const': ['error', { destructuring: 'all' }],

    // Imports
    'import/extensions': ['error', 'ignorePackages', { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' }],
    'import/order': ['error', {
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [{ pattern: 'react', group: 'external', position: 'before' }],
      pathGroupsExcludedImportTypes: ['react'],
    }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: [
        'src/setupProxy.js',
        '**/*.test.*',
        '**/*.config.*',
        '**/vite.*',
      ],
    }],

    // Spacing
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'function', next: '*' },
      { blankLine: 'always', prev: 'class', next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
    ],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/function-component-definition': ['error', {
      namedComponents: 'arrow-function',
      unnamedComponents: 'arrow-function',
    }],
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],

    // TS + modern React: don’t require defaultProps if using TS & defaults
    'react/require-default-props': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-alert': 'off'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['src/setupProxy.js'],
      rules: { 'no-console': 'off' }, // allow logs in proxy
    },
  ],
};
