import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port-component'],
  classNameBindings: [  'port.isConnected:connected',
                        'port.isSource:source',
                        'port.isDestination:destination',
                        'port.isValue:value',
                        'port.isEvent:event'
                      ],

  click() {
    console.log('----- port component sending select action');
    this.attrs.select();
  }
});
