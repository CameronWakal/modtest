import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch-diagram'],
  tagName: 'canvas',
  
  connections: [],
  newConnectionFrom: null,

  mouseListenerAdded: false,

  didInsertElement(){
      this.onPortsChanged();
  },

  onMovingModuleChanged: Ember.observer('movingModule', function(sender, key, value, rev) {
    if(this.get('movingModule')) {
      this.addMouseListener();
    } else {
      this.removeMouseListener();
    }
  }),

  onConnectingFromPortChanged: Ember.observer('connectingFromPort', function(sender, key, value, rev) {
    if(this.get('connectingFromPort')) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        //if this isn't scheduled, the ember classNameBindings don't get updated
        //in time to be used by this function.
        this.addNewConnection();
      });
    } else {
      this.removeNewConnection();
    }
  }),

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
    let module = this.$().siblings('#modules').children('.portConnectingFrom');
    console.log('addNewConnection module', module);
    let port = $(module).children('.connectingFrom');
    this.addMouseListener();
    this.set('newConnectionFrom', port);
    this.drawConnections();
  },

  //stop drawing from the new connection port to the cursor location
  removeNewConnection() {
    console.log('remove new connection');
    this.set('newConnectionFrom', null);
    this.removeMouseListener();
    this.drawConnections();
  },

  //add a mouse listener if it isn't already set
  addMouseListener() {
    let mouseListenerAdded = this.get('mouseListenerAdded');
    if(!mouseListenerAdded) {
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
      this.set('mouseListenerAdded', true);
    }
  },

  //remove the mouse listener only if there is neither a moving module or a connecting port
  removeMouseListener() {
    let mouseListenerAdded = this.get('mouseListenerAdded');
    let movingModule = this.get('movingModule');
    let connectingFromPort = this.get('connectingFromPort');
    if(mouseListenerAdded && !movingModule && !connectingFromPort) {
      $(document).off('mousemove');
      this.set('mouseListenerAdded', false);
    }
    
  },

  //callback for mousemove on body
  mouseMoveBody(event) {
    event.preventDefault();
    console.log('diagram movingModule', this.get('movingModule'));
    if(this.get('movingModule')) {
      console.log('diagram movingModule');
      this.drawConnections(event);
    }
    if(this.get('connectingFromPort')) {
      console.log('diagram connectingFromPort');
      this.drawConnections(event);
    }
  },

  //draw connections between ports,
  //draw line from new connection port to cursor position
  drawConnections(event) {
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
    if(newPort && event) {
      console.log('newport', newPort);
      startX = $(newPort).offset().left + $(newPort).outerWidth()/2;
      startY = $(newPort).offset().top + $(newPort).outerHeight()/2;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(event.pageX, event.pageY);
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }

  },
  

});
