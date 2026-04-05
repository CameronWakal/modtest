'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function(defaults) {
  const { setConfig } = await import('@warp-drive/build-config');

  let app = new EmberApp(defaults, {
    // Add options here
    sassOptions: {
      includePaths: ['app']
    }
  });

  // Configure WarpDrive/Ember Data 5.x - must be called after EmberApp is created
  // but before toTree() to properly configure the build
  setConfig(app, __dirname, {
    deprecations: {
      // Suppress tracking package deprecation - we use @warp-drive/ember/install instead
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });

  return app.toTree();
};
