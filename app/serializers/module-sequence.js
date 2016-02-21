import ModuleSerializer from './module';

export default ModuleSerializer.extend({

  attrs: {
    inputArray: { embedded: 'always' },
  },
  
});
