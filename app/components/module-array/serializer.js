import ModuleSerializer from '../module/serializer';

export default class ModuleArraySerializer extends ModuleSerializer {
  attrs = {
    portGroups: { embedded: 'always' },
    settings: { embedded: 'always' },
    steps: { embedded: 'always' }
  };
}
