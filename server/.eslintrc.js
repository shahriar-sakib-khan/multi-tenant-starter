module.exports = {
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser', // Parse both JS and TS
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true, // for React JSX
    },
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'unused-imports',
    'promise',
    'react',
    'react-hooks',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // TS rules
    'plugin:import/recommended',
    'plugin:import/typescript', // support import rules for TS
    'plugin:promise/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:node/recommended',
    'prettier', // disable ESLint rules conflicting with Prettier
  ],
  settings: {
    react: {
      version: 'detect', // detect React version automatically
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'], // resolve these
      },
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint-import-resolver-typescript
    },
  },
  rules: {
    // General
    'no-console': 'warn', // warn about console.log in prod code
    'unused-imports/no-unused-imports': 'warn', // clean unused imports

    // TypeScript specifics
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off', // too noisy, opt-in later
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // React
    'react/prop-types': 'off', // TS covers this
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+

    // Import rules
    'import/no-unresolved': 'error',
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
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // Promise
    'promise/always-return': 'warn',
    'promise/catch-or-return': 'warn',

    // Node.js
    'node/no-unsupported-features/es-syntax': 'off', // allow import/export

    // Prettier integration
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: true,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2,
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // TypeScript only overrides (if any)
      },
    },
    {
      files: ['*.js', '*.jsx'],
      rules: {
        // JavaScript only overrides (if any)
      },
    },
  ],
};
