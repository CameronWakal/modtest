import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['module'],
  attributeBindings: ['inlineStyles:style'],
  classNameBindings: ['isConnectingFrom:connectingFrom'],

  mouseIsDragging: false,
  mouseIsDown: false,
  isConnectingFrom: false,
  xPos: Ember.computed.alias('module.xPos'),
  yPos: Ember.computed.alias('module.yPos'),

  dragOffsetX: null,
  dragOffsetY: null,

  inlineStyles: Ember.computed('xPos', 'yPos', function(){
    let styleString = 'left:'+this.get('xPos')+'px;'+'top:'+this.get('yPos')+'px';
    return new Ember.Handlebars.SafeString(styleString);
  }),
  
  mouseDown(event) {
    event.preventDefault();
    this.set('mouseIsDown', true);
    this.set('dragOffsetX', event.pageX - this.get('xPos') );
    this.set('dragOffsetY', event.pageY - this.get('yPos') );
    $(document).on('mousemove', this.mouseMoveBody.bind(this));
    $(document).on('mouseup', this.mouseUpBody.bind(this));
    console.log('module mousedown');
  },
  
  mouseUpBody(event) {
    event.preventDefault();
    let self = this;
    Ember.run(function(){
      if(self.get('mouseIsDragging')) {
        self.get('module').save();
      }
      self.set('mouseIsDown', false);
      self.set('mouseIsDragging', false);
      $(document).off('mousemove');
      $(document).off('mouseup'); 
    });
  },
  
  mouseMoveBody(event) {
    event.preventDefault();
    let self = this;
    Ember.run(function(){
      self.set('mouseIsDragging', true);
      self.set('xPos', event.pageX - self.get('dragOffsetX') );
      self.set('yPos', event.pageY - self.get('dragOffsetY') );
      self.attrs.drawDiagram();
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
    setDiagramShouldDrawNewConnectionFrom(portType){
      if(portType) {
        this.set('isConnectingFrom', true);
        this.attrs.setDiagramShouldDrawNewConnectionFrom(portType);
      } else {
        this.set('isConnectingFrom', false);
        this.attrs.setDiagramShouldDrawNewConnectionFrom(null);
      }
      
    },
  },
  
});
