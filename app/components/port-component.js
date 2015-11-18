import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port-component'],
  classNameBindings: [  'model.isConnected:connected',
                        'model.isSource:source',
                        'model.isDestination:destination',
                        'model.isValue:value',
                        'model.isEvent:event'
                      ],

  click() {
    console.log('----- port component sending select action');
    this.attrs.select();
  }
});
