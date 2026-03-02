// Shim to restore the Ember global for legacy addons (ember-localforage-adapter)
// This file is prepended to vendor.js via ember-cli-build.js
// At the time this runs, ember-source hasn't been evaluated yet, so we use a lazy getter
(function() {
  var _Ember = null;
  Object.defineProperty(window, 'Ember', {
    configurable: true,
    enumerable: true,
    get: function() {
      if (!_Ember && typeof require === 'function') {
        try {
          _Ember = require('ember').default;
        } catch(e) {
          // ember module not yet available
        }
      }
      return _Ember;
    },
    set: function(value) {
      _Ember = value;
    }
  });
})();
