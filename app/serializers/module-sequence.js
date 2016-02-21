import ModuleSerializer from './module';

export default ModuleSerializer.extend({

  attrs: {
    stepArray: { embedded: 'always' },
  },
  
});
