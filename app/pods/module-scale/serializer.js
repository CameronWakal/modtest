import ModuleSerializer from '../../serializers/module';

export default ModuleSerializer.extend({

  attrs: {
    degrees: { embedded: 'always' }
  },
  
});
