module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: 'eslint:recommended',
  globals: {
    angular: 'readonly',
    $: 'readonly',
    // paper.js
    paper: 'readonly',
    Path: 'readonly',
    Point: 'readonly',
    Rectangle: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {}
};
