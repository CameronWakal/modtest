import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs: {
    ports: { embedded: 'always' },
  },

});
