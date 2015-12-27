import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch-diagram'],
  tagName: 'canvas',

  didInsertElement() {
    var c= this.$().get(0);
    var ctx=c.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.beginPath();
/*
    let modules = this.get('patch.modules');
    modules.forEach(function(module){
      let eventOuts = module.get('eventOutPorts');
      let valueOuts = module.get('valueOutPorts');
      eventOuts.forEach(function(port){
        console.log('eventOut:', port);
      });
      valueOuts.forEach(function(port){
        console.log('valueOut:', port);
      });
    });
*/
    ctx.moveTo(0,0);
    ctx.lineTo(300,150);
    ctx.stroke();
  }

});
