import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs: {
    // undocumented option useful for polymorphic hasmany unembedded relationships, see
    // https://github.com/emberjs/data/blob/v2.14.10/addon/serializers/embedded-records-mixin.js#L506
    modules: { serialize: 'ids-and-types', deserialize: 'ids-and-types' },
    busses: { serialize: 'ids-and-types', deserialize: 'ids-and-types' }
  }

});
