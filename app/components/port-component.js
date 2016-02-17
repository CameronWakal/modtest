import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port'],
  classNameBindings: [
    'port.isConnected:connected', 
    'isConnectingFrom:connectingFrom', 
    'port.uniqueCssIdentifier'
  ],
  attributeBindings: ['tabindex'],
  tabindex: -1,

  isConnectingFrom: false,
  
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
  },

});
