import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port-component'],
  classNameBindings: ['model.isConnected:connected'],

  click() {
    console.log('----- port component sending select action');
    this.attrs.select();
  }
});
