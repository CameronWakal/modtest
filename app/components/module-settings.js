import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['module-settings'],
  classNameBindings: ['isEmpty:empty'],

  isEmpty: Ember.computed.empty('module'),

});
