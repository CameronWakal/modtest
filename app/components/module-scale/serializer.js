import ModuleSerializer from '../module/serializer';

export default ModuleSerializer.extend({

  attrs: {
    degrees: { embedded: 'always' },
    settings: { embedded: 'never'}
  }

});
