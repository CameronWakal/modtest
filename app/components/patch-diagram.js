import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch-diagram'],
  tagName: 'canvas',

  didInsertElement() {
    this.set('patch.needsDraw', true);
    this.draw();
  },
  
  draw: Ember.observer('patch.needsDraw', function(sender, key, value, rev) {
    if(this.get('patch.needsDraw')) {

      var c= this.$().get(0);
      var ctx=c.getContext("2d");
      ctx.canvas.width  = window.innerWidth;
      ctx.canvas.height = window.innerHeight;
      
      var startX, startY, endX, endY;
      var outPorts, inPorts, outPortDom, inPortDom;

      let modulesDom = this.$().siblings('#modules').children();
      let modules = this.get('patch.modules');

      modules.forEach(function(module){
        
        outPorts = module.get('outPorts');
        outPorts.forEach(function(outPort){

          outPortDom = $(modulesDom).find('.'+outPort.get('uniqueCssIdentifier'));
          startX = $(outPortDom).offset().left + $(outPortDom).outerWidth()/2;
          startY = $(outPortDom).offset().top + $(outPortDom).outerHeight()/2; 

          inPorts = outPort.get('connections');
          inPorts.forEach(function(inPort){

            inPortDom = $(modulesDom).find('.'+inPort.get('uniqueCssIdentifier'));
            endX = $(inPortDom).offset().left + $(inPortDom).outerWidth()/2;
            endY = $(inPortDom).offset().top + $(inPortDom).outerHeight()/2;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

          });
        });
      });

      this.set('patch.needsDraw', false);
    }
  }),
  

});
