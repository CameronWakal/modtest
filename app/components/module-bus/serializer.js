import ApplicationSerializer from '../../serializers/application';

export default ApplicationSerializer.extend({

  attrs: {
    portGroups: { embedded: 'always' }
  }

});
