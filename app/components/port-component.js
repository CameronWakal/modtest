import Ember from 'ember';

export default Ember.Component.extend({
  signalType: null,
  portType: null,
  name: null,
  click() {
    console.log('----- port component sending select action');
    this.attrs.select();
  }
});
