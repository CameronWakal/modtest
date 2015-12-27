import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['module'],
  attributeBindings: ['inlineStyles:style'],

  isDragging: false,
  xPos: Ember.computed.alias('module.xPos'),
  yPos: Ember.computed.alias('module.yPos'),

  dragOffsetX: null,
  dragOffsetY: null,

  inlineStyles: Ember.computed('xPos', 'yPos', function(){
    let styleString = 'left:'+this.get('xPos')+'px;'+'top:'+this.get('yPos')+'px';
    return new Ember.Handlebars.SafeString(styleString);
  }),
  
  mouseDown(event) {
    console.log('mousedown');
    this.set('isDragging', true);
    this.set('dragOffsetX', event.pageX - this.get('xPos') );
    this.set('dragOffsetY', event.pageY - this.get('yPos') );
  },
  
  //todo: maybe this shouldn't save if property values aren't dirty?
  mouseUp(event) {
    this.set('isDragging', false);
    this.set( 'xPos', event.pageX - this.get('dragOffsetX') );
    this.set( 'yPos', event.pageY - this.get('dragOffsetY') );
    this.get('module').save();
  },
  
  mouseMove(event) {
    if(this.get('isDragging')){
      this.set('xPos', event.pageX - this.get('dragOffsetX') );
      this.set('yPos', event.pageY - this.get('dragOffsetY') );
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
