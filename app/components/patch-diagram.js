import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch-diagram'],
  tagName: 'canvas',
  
  connections: [],

  didInsertElement(){
    
  },

  onPortsChanged: Ember.observer('patch.portsChanged', function(sender, key, value, rev) {
    if(this.get('patch.portsChanged')){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.updateConnections();
        this.drawConnections();
        this.set('patch.portsChanged', false);
      });
    }
  }),

  onPortsMoved: Ember.observer('patch.portsMoved', function(sender, key, value, rev) {
    if(this.get('patch.portsMoved')){
      console.log('ports moved');
      this.drawConnections();
      this.set('patch.portsMoved', false);
    }
  }),

  updateConnections() {
    console.log('update connections');
    var outPorts, inPorts, outPortDom, inPortDom;

    let modulesDom = this.$().siblings('#modules').children();
    let modules = this.get('patch.modules');
    this.set('connections', []);
    let self = this;

    modules.forEach(function(module){
      
      outPorts = module.get('outPorts');
      outPorts.forEach(function(outPort){

        outPortDom = $(modulesDom).find('.'+outPort.get('uniqueCssIdentifier'));

        inPorts = outPort.get('connections');
        inPorts.forEach(function(inPort){

          inPortDom = $(modulesDom).find('.'+inPort.get('uniqueCssIdentifier'));          
          self.get('connections').addObject({ 'inPortDom':inPortDom, 'outPortDom':outPortDom });
        });
      });
    });
  },

  drawConnections() {
    console.log('drawConnections');
    var c= this.$().get(0);
    var ctx=c.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    
    var startX, startY, endX, endY;

    let connections = this.get('connections');
    connections.forEach(function(con){

      startX = $(con.outPortDom).offset().left + $(con.outPortDom).outerWidth()/2;
      startY = $(con.outPortDom).offset().top + $(con.outPortDom).outerHeight()/2;
      endX = $(con.inPortDom).offset().left + $(con.inPortDom).outerWidth()/2;
      endY = $(con.inPortDom).offset().top + $(con.inPortDom).outerHeight()/2; 

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

    });
  },
  

});
