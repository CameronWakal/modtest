import ApplicationSerializer from './application';

export default class ArraySerializer extends ApplicationSerializer {
  attrs = {
    items: { embedded: 'always' }
  };

  // Restore inverse relationship on embedded items during normalization
  // (EmbeddedRecordsMixin strips the foreign key during serialization)
  normalize(modelClass, resourceHash) {
    if (resourceHash.items && resourceHash.id) {
      resourceHash.items.forEach(item => {
        item.array = resourceHash.id;
      });
    }
    return super.normalize(...arguments);
  }
}
