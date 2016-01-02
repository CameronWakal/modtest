import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['port'],
  classNameBindings: [
    'port.isConnected:connected', 
    'isConnectingFrom:connectingFrom', 
    'port.uniqueCssIdentifier'
  ],

  mouseIsDown: false,
  isConnectingFrom: false,

  didInsertElement() {
    
  },

  mouseDown(event) {
    event.preventDefault();
    this.set('mouseIsDown', true);
    this.set('isConnectingFrom', true);
    $(document).on('mouseup', this.mouseUpBody.bind(this));
    this.attrs.setDiagramShouldDrawNewConnection(true);
    return false;
  },
  
  mouseUpBody(event) {
    event.preventDefault();
    let self = this;
    Ember.run(function(){
      self.set('mouseIsDown', false);
      self.set('isConnectingFrom', false);
      self.attrs.setDiagramShouldDrawNewConnection(false);
      $(document).off('mouseup'); 
    });
  },

  click() {
    console.log('----- port component sending select action');
    this.attrs.select();
  },

});
