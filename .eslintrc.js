const config = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  parser: 'babel-eslint',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsdoc/recommended',
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    expect: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
  },
  plugins: [
    'react',
    'chai-expect',
    'chai-friendly',
    'jsdoc',
  ],
  rules: {
    indent: [
      'error',
      2,
      { SwitchCase: 1 },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    quotes: [
      'error',
      'single',
    ],
    semi: [
      'error',
      'always',
    ],
    'no-use-before-define': ['error', { functions: false, classes: true, variables: false }],
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
    'valid-jsdoc': [
      'error',
      {
        requireParamDescription: false,
        requireReturnDescription: false,
        requireReturn: false,
      },
    ],
    'no-extra-parens': 0,

  },
};

module.exports = config;
