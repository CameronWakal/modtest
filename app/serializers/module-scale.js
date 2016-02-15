import DS from 'ember-data';
import ModuleSerializer from './module';

export default ModuleSerializer.extend({

  attrs: {
    degrees: { embedded: 'always' }
  },
  
});
