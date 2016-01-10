import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port'],
  classNameBindings: [
    'port.isConnected:connected', 
    'isConnectingFrom:connectingFrom', 
    'port.uniqueCssIdentifier'
  ],

  isConnectingFrom: false,
  
  mouseDown(event) {
    event.preventDefault();
    this.set('isConnectingFrom', true);
    $(document).on('mouseup', this.mouseUpBody.bind(this));
    this.sendAction('startedConnecting', event);
    return false;
  },
  
  mouseUpBody(event) {
    event.preventDefault();
    let self = this;
    Ember.run(function(){
      self.set('isConnectingFrom', false);
      self.sendAction('finishedConnecting');
      $(document).off('mouseup'); 
    });
  },

});
