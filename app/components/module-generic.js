import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['module'],
  classNameBindings: ['portIsConnectingFrom:portConnectingFrom'],
  attributeBindings: ['inlineStyles:style', 'tabindex'],
  tabindex: -1,

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
    Ember.$(document).on('mouseup', this.mouseUpBody.bind(this));
    Ember.$(document).on('mousemove', this.mouseMoveBody.bind(this));
    this.sendAction('selected');
    this.sendAction('startedMoving');
  },

  keyDown(event) {
    if( event.keyCode === 8 && this.$().is(':focus') ) {
      event.preventDefault();
      this.sendAction('remove');
    }
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
      }
      self.sendAction('finishedMoving');
      Ember.$(document).off('mouseup');
      Ember.$(document).off('mousemove');
    });
  },

  actions: {
    remove() {
      this.attrs.remove();
    },
    selectPort(port) {
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

    mouseEnterPort(port) {
      this.sendAction('mouseEnterPort', port);
    },

    mouseLeavePort(port) {
      this.sendAction('mouseLeavePort', port);
    },

    disconnectPort(port) {
      port.disconnect();
      this.get('module').save();
      this.sendAction('portDisconnected', port);
    }

  },
  
});
