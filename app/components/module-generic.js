import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['module'],
  attributeBindings: ['inlineStyles:style'],

  mouseIsDragging: false,
  mouseIsDown: false,
  xPos: Ember.computed.alias('module.xPos'),
  yPos: Ember.computed.alias('module.yPos'),

  dragOffsetX: null,
  dragOffsetY: null,

  inlineStyles: Ember.computed('xPos', 'yPos', function(){
    let styleString = 'left:'+this.get('xPos')+'px;'+'top:'+this.get('yPos')+'px';
    return new Ember.Handlebars.SafeString(styleString);
  }),
  
  mouseDown(event) {
    this.set('mouseIsDown', true);
    this.set('dragOffsetX', event.pageX - this.get('xPos') );
    this.set('dragOffsetY', event.pageY - this.get('yPos') );
  },
  
  mouseUp(event) {
    if(this.get('mouseIsDragging')) {
      this.get('module').save();
    }
    this.set('mouseIsDown', false);
    this.set('mouseIsDragging', false);
  },
  
  mouseMove(event) {
    if(this.get('mouseIsDown')){
      this.set('mouseIsDragging', true);
      this.set('xPos', event.pageX - this.get('dragOffsetX') );
      this.set('yPos', event.pageY - this.get('dragOffsetY') );
      this.set('module.patch.portsMoved', true);
    }
  },
  
  actions: {
    remove() {
      this.attrs.remove();
    },
    selectPort(port) {
      console.log('---- module component sending select action for port '+port.get('label'));
      this.attrs.selectPort(port);
    },
  },
  
});
