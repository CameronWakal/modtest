import LFSerializer from 'ember-localforage-adapter/serializers/localforage';
import DS from 'ember-data';

export default LFSerializer.extend(
  DS.EmbeddedRecordsMixin, {
    attrs: {
      port: { embedded: 'always' },
      out: { embedded: 'always' },
      clock: { embedded: 'always' },
      sequence: { embedded: 'always' },
      step: { embedded: 'always' }
    }
  }
);
