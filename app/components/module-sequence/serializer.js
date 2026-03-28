import ModuleSerializer from '../module/serializer';

export default class ModuleSequenceSerializer extends ModuleSerializer {
  attrs = {
    portGroups: { embedded: 'always' },
    settings: { embedded: 'always' },
    steps: { embedded: 'always' }
  };
}
