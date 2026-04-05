import js from '@eslint/js';
import globals from 'globals';
import emberRecommended from 'eslint-plugin-ember/recommended';
import babelParser from '@babel/eslint-parser';
import nodePlugin from 'eslint-plugin-n';

export default [
  // Global ignores (migrated from .eslintignore)
  {
    ignores: [
      'blueprints/*/files/',
      'vendor/',
      'dist/',
      'tmp/',
      'bower_components/',
      'node_modules/',
      'coverage/',
      '.node_modules.ember-try/',
      'bower.json.ember-try',
      'package.json.ember-try',
    ],
  },

  // Base recommended rules
  js.configs.recommended,

  // Ember recommended config (base for .js files)
  emberRecommended.configs.base,

  // App files - browser environment with Babel parser for decorators
  {
    files: ['app/**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'no-console': 'off',
      'ember/no-observers': 'off',
      'ember/no-jquery': 'error',
      // TODO: Migrate to ember-concurrency or ember-lifeline
      'ember/no-runloop': 'off',
    },
  },

  // Test files - browser + QUnit globals
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
          plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.qunit,
      },
    },
    rules: {
      'no-console': 'off',
      'ember/no-observers': 'off',
      'ember/no-jquery': 'error',
      'ember/no-runloop': 'off',
    },
  },

  // Node config files (CommonJS)
  {
    files: [
      '.template-lintrc.js',
      'testem.js',
      'config/**/*.js',
      'lib/*/index.js',
      'server/**/*.js',
    ],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      n: nodePlugin,
    },
    rules: {
      ...nodePlugin.configs['flat/recommended-script'].rules,
      'n/no-unpublished-require': 'off',
    },
  },

  // ember-cli-build.js uses async/await and dynamic imports (ES modules + Node)
  {
    files: ['ember-cli-build.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      n: nodePlugin,
    },
    rules: {
      ...nodePlugin.configs['flat/recommended-module'].rules,
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': 'off',
      // @warp-drive/build-config is a transitive dep via @warp-drive/ember
      'n/no-extraneous-import': 'off',
    },
  },
];
