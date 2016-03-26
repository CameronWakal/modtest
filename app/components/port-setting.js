import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['port-setting'],
  classNameBindings: [
    'port.isConnected:connected', 
    'port.isEnabled:enabled'
  ],

  portIsValueOut: Ember.computed.equal('port.type', 'port-value-out'),
  labelWithType: Ember.computed('port.label', 'port.type', function(){
    let type = this.get('port.type');
    let label = this.get('port.label');
    switch(type){
      case 'port-value-in':
        return '> ' + label;
      case 'port-value-out':
        return label + ' >';
      case 'port-event-in':
        return '-> ' + label;
      case 'port-event-out':
        return label + ' ->';
    }
  })
});
