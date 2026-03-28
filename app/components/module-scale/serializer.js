import ModuleSerializer from '../module/serializer';

export default class ModuleScaleSerializer extends ModuleSerializer {
  attrs = {
    portGroups: { embedded: 'always' },
    settings: { embedded: 'always' },
    degrees: { embedded: 'always' }
  };
}
