import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port'],
  classNameBindings: ['port.isConnected:connected', 'port.uniqueCssIdentifier'],

  didInsertElement() {
    
  },

  click() {
    console.log('----- port component sending select action');
    this.attrs.select();
  },

});
