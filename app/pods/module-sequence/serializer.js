import ModuleSerializer from '../module/serializer';

export default ModuleSerializer.extend({

  attrs: {
    steps: { embedded: 'always' },
  },
  
});
