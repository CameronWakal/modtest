import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs: {
    inputs: { embedded: 'always' },
  },

});
