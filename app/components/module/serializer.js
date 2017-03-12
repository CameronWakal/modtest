import ApplicationSerializer from '../../serializers/application';

export default ApplicationSerializer.extend({

  attrs: {
    ports: { embedded: 'always' },
    settings: { embedded: 'always' }
  }

});