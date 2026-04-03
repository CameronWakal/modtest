// This initializer ensures WarpDrive's Ember reactivity integration is loaded
// before the store is used. The import has side effects that configure the
// reactivity system.
import '@warp-drive/ember/install';
import { registerDeprecationHandler } from '@ember/debug';

export function initialize() {
  // Silence known WarpDrive deprecations that don't apply to our architecture.
  // This app uses a custom IndexedDB adapter (not HTTP/JSON:API), so the
  // store.request() migration path isn't directly applicable. We use store.findAll
  // which delegates to our adapter's findAll method for local database access.
  // TODO: Migrate to a custom request handler pattern when WarpDrive provides
  // better support for non-HTTP storage backends.
  registerDeprecationHandler((message, options, next) => {
    if (options?.id === 'warp-drive:deprecate-legacy-request-methods') {
      return; // Silence this deprecation
    }
    next(message, options);
  });
}

export default {
  initialize,
  before: 'ember-data',
};
