import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['module'],
  attributeBindings: ['inlineStyles:style'],
  classNameBindings: [
    'portIsConnectingFrom:portConnectingFrom',
    'isMoving:moving',
  ],

  isMoving: false,
  portIsConnectingFrom: false,
  xPos: Ember.computed.alias('module.xPos'),
  yPos: Ember.computed.alias('module.yPos'),

  inlineStyles: Ember.computed('xPos', 'yPos', function(){
    let styleString = 'left:'+this.get('xPos')+'px;'+'top:'+this.get('yPos')+'px';
    return new Ember.Handlebars.SafeString(styleString);
  }),
  
  mouseDown(event) {
    this.set('isMoving', true);
    $(document).on('mouseup', this.mouseUpBody.bind(this));
    this.sendAction('startedMoving', event);
    console.log('module mousedown');
  },
  
  mouseUpBody(event) {
    event.preventDefault();
    let self = this;
    Ember.run(function(){
      self.set('isMoving', false);
      self.sendAction('finishedMoving');
      $(document).off('mouseup'); 
    });
  },

  actions: {
    remove() {
      this.attrs.remove();
    },
    selectPort(port) {
      console.log('---- module component sending select action for port '+port.get('label'));
      this.attrs.selectPort(port);
    },

    portStartedConnecting(port) {
      this.set('portIsConnectingFrom', true);
      this.sendAction('portStartedConnecting', port);
    },

    portFinishedConnecting() {
      this.set('portIsConnectingFrom', false);
      this.sendAction('portFinishedConnecting');
    },

  },
  
});
