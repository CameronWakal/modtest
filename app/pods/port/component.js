import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port'],
  classNameBindings: [
    'port.isConnected:connected', 
    'isConnectingFrom:connecting-from', 
    'port.uniqueCssIdentifier'
  ],
  attributeBindings: ['tabindex'],
  tabindex: -1,

  isConnectingFrom: false,
  
  onDisable: Ember.observer('port.isEnabled', function(){
    if( !this.get('port.isEnabled') && !Ember.isEmpty(this.get('port.connections')) ) {
      this.sendAction('disconnect');
    }
  }),

  mouseDown(event) {
    event.preventDefault();
    this.$().focus();
    this.set('isConnectingFrom', true);
    Ember.$(document).on('mouseup', this.mouseUpBody.bind(this));
    this.sendAction('startedConnecting', event);
    return false;
  },
  
  mouseUpBody(event) {
    event.preventDefault();
    this.$().blur();
    let self = this;
    Ember.run(function(){
      self.set('isConnectingFrom', false);
      self.sendAction('finishedConnecting');
      Ember.$(document).off('mouseup'); 
    });
  }

});
