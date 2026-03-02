'use strict';

module.exports = {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // Disable rules that were disabled in .sass-lint.yml
    'selector-max-compound-selectors': null,
    'max-nesting-depth': null,
    // Allow Ember-style naming conventions
    'selector-class-pattern': null,
    // Allow @import (will migrate to @use later per MODERNIZATION_PLAN)
    'scss/at-import-partial-extension': null,
    // Relax strict rules for existing codebase
    'no-descending-specificity': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'no-empty-source': null,
    'declaration-empty-line-before': null,
    'scss/dollar-variable-empty-line-before': null,
    'scss/double-slash-comment-whitespace-inside': null,
    'scss/double-slash-comment-empty-line-before': null,
    'font-family-name-quotes': null,
    'color-function-notation': null,
    'alpha-value-notation': null
  }
};
