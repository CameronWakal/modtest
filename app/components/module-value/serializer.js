import ModuleSerializer from '../module/serializer';

export default ModuleSerializer.extend({

  attrs: {
    value: { embedded: 'always' }
  }

});
