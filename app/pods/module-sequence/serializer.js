import ModuleSerializer from '../../serializers/module';

export default ModuleSerializer.extend({

  attrs: {
    steps: { embedded: 'always' },
  },
  
});
