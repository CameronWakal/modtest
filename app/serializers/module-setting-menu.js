import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  attrs: {
    items: { embedded: 'always' }
  }

});
