'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    // Using custom did-insert/did-update modifiers, not @ember/render-modifiers
    'no-at-ember-render-modifiers': 'off',
    // Intentional for drag-and-drop interactions
    'no-pointer-down-event-binding': 'off'
  }
};
