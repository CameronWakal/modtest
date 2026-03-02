import ModuleSerializer from '../module/serializer';

export default ModuleSerializer.extend({

  attrs: {
    portGroups: { embedded: 'always' },
    settings: { embedded: 'always' },
    steps: { embedded: 'always' }
  }

});
