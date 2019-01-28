import ApplicationSerializer from '../../serializers/application';

export default ApplicationSerializer.extend({

  attrs: {
    basePorts: { embedded: 'always' },
    expansionPorts: { embedded: 'always' }
  }

});
