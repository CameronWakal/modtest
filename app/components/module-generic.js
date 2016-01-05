import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['module'],
  attributeBindings: ['inlineStyles:style'],
  classNameBindings: ['portIsConnectingFrom:portConnectingFrom'],

  isMoving: false,
  didMove: false,
  moveOffsetX: null,
  moveOffsetY: null,
  xPos: Ember.computed.alias('module.xPos'),
  yPos: Ember.computed.alias('module.yPos'),

  portIsConnectingFrom: false,

  inlineStyles: Ember.computed('xPos', 'yPos', function(){
    let styleString = 'left:'+this.get('xPos')+'px;'+'top:'+this.get('yPos')+'px';
    return new Ember.Handlebars.SafeString(styleString);
  }),
  
  mouseDown(event) {
    this.set('isMoving', true);
    this.set('moveOffsetX', event.pageX - this.get('xPos') );
    this.set('moveOffsetY', event.pageY - this.get('yPos') );
    $(document).on('mouseup', this.mouseUpBody.bind(this));
    $(document).on('mousemove', this.mouseMoveBody.bind(this));
    this.sendAction('startedMoving');
    console.log('module mousedown');
  },

  mouseMoveBody(event) {
    event.preventDefault();
    let self = this;
    Ember.run(function(){
      self.set('didMove', true);
      self.set('xPos', event.pageX - self.get('moveOffsetX') );
      self.set('yPos', event.pageY - self.get('moveOffsetY') );
    });
  },
  
  mouseUpBody(event) {
    event.preventDefault();
    let self = this;
    Ember.run(function(){
      self.set('isMoving', false);
      if(self.get('didMove')) {
        self.get('module').save();
        self.set('didMove', false);
        console.log('module position saved');
      }
      self.sendAction('finishedMoving');
      $(document).off('mouseup');
      $(document).off('mousemove');
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
