module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended'
    // 'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'no-console': 'off',
    'ember/no-observers': 'off'
  }
};
