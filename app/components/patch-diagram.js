import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch-diagram'],
  tagName: 'canvas',
  
  connections: [],
  newConnectionFrom: null,

  didInsertElement(){
      this.onPortsChanged();
  },

  //flag changes to true when controller wants diagram to update list of ports
  onPortsChanged: Ember.observer('needsUpdate', function(sender, key, value, rev) {
    if(this.get('needsUpdate')){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.updateConnections();
        this.drawConnections();
        this.attrs.didUpdate();
      });
    }
  }),

  //flag represents whether diagram should be drawing connection between
  //new connection port and current cursor location on mousemove
  onShouldDrawNewConnection: Ember.observer('shouldDrawNewConnection', function(sender, key, value, rev) {
    if(this.get('shouldDrawNewConnection')){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.addNewConnection();
      });
    } else {
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.removeNewConnection();
      });
    }
  }),

  //flag is changed to true when controller wants diagram to redraw
  onPortsMoved: Ember.observer('needsDraw', function(sender, key, value, rev) {
    if(this.get('needsDraw')){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.drawConnections();
        this.attrs.didDraw();
      });
    }
  }),

  //search for connected ports in dom and store the jquery objects
  //so we can draw connections between ports later.
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

  //start drawing a line from the new connection port to the cursor location on mouse move
  addNewConnection() {
    console.log('add new connection');
    let module = this.$().siblings('#modules').children('.connectingFrom');
    let port = $(module).children('.connectingFrom');
    this.set('newConnectionFrom', port);
    //$(document).on('mousemove', this.mouseMoveBody.bind(this));
    this.drawConnections();
  },

  //stop drawing from the new connection port to the cursor location
  removeNewConnection() {
    console.log('remove new connection');
    this.set('newConnectionFrom', null);
    //$(document).off('mousemove');
    this.drawConnections();
  },

  /*
  mousemoves not working now that patch component is eventmanager
  //callback for mousemove on body
  mouseMoveBody(event) {
    console.log('diagram mouseMoveBody');
    this.drawConnections(event);
  },
  */

  //draw connections between ports,
  //draw line from new connection port to cursor position
  drawConnections() {
    let newPort = this.get('newConnectionFrom');

    var c= this.$().get(0);
    var ctx=c.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.strokeStyle = 'black';
    if(newPort) {
      ctx.strokeStyle = '#bbb';
    }

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

    //drawing a line from selected port to current mouse drag position
    if(newPort) {
      startX = $(newPort).offset().left + $(newPort).outerWidth()/2;
      startY = $(newPort).offset().top + $(newPort).outerHeight()/2;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(this.get('connectingPosX'), this.get('connectingPosY'));
      console.log(this.get('connectingPosX'),this.get('connectingPosY'));
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }

  },
  

});
