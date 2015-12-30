import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port'],
  classNameBindings: ['port.isConnected:connected', 'port.uniqueCssIdentifier'],

  didInsertElement() {
    
  },

  labelChanged: Ember.observer('port.label', function(sender, key, value, rev) {
    console.log('port component label changed to '+this.get('port.label'));

    let patch = this.get('port.module.patch');
    if(patch){
      patch.set('portsChanged', true);
    }

  }),

  click() {
    console.log('----- port component sending select action');
    this.attrs.select();
  },

});
