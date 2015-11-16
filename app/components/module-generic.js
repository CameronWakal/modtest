import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['module'],

  actions: {
    remove() {
      this.attrs.remove();
    },
    selectPort(port) {
      console.log('---- module component sending select action for port '+port.get('label'));
      this.attrs.selectPort(port);
    },
  },
  
});
