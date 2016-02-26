import ModuleSerializer from './module';

export default ModuleSerializer.extend({

  attrs: {
    steps: { embedded: 'always' },
  },
  
});
