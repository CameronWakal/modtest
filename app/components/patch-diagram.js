import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['patch-diagram'],
  attributeBindings: ['tabindex'],
  tabindex: -1,
  tagName: 'canvas',
  
  connections: [],
  selectedConnectionIndex: null,
  newConnectionFrom: null,

  mouseListenerAdded: false,

  didInsertElement(){
      this.onPortsChanged();
  },

  onMovingModuleChanged: Ember.observer('movingModule', function() {
    if(this.get('movingModule')) {
      this.addMouseListener();
    } else {
      this.removeMouseListener();
    }
  }),

  onConnectingFromPortChanged: Ember.observer('connectingFromPort', function() {
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
  onPortsChanged: Ember.observer('needsUpdate', function() {
    if(this.get('needsUpdate')){
      Ember.run.scheduleOnce('afterRender', this, function() {
        this.updateConnections();
        this.drawConnections();
        this.attrs.didUpdate();
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

        outPortDom = Ember.$(modulesDom).find('.'+outPort.get('uniqueCssIdentifier'));

        inPorts = outPort.get('connections');
        inPorts.forEach(function(inPort){

          inPortDom = Ember.$(modulesDom).find('.'+inPort.get('uniqueCssIdentifier'));          
          self.get('connections').addObject({ 
            'inPortDom':inPortDom, 
            'outPortDom':outPortDom,
            'inPort':inPort,
            'outPort':outPort 
          });
        });
      });
    });
  },

  //start drawing a line from the new connection port to the cursor location on mouse move
  addNewConnection() {
    console.log('add new connection');
    let module = this.$().siblings('#modules').children('.portConnectingFrom');
    let port = Ember.$(module).children('.connectingFrom');
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
      Ember.$(document).on('mousemove', this.mouseMoveBody.bind(this));
      this.set('mouseListenerAdded', true);
    }
  },

  //remove the mouse listener only if there is neither a moving module or a connecting port
  removeMouseListener() {
    let mouseListenerAdded = this.get('mouseListenerAdded');
    let movingModule = this.get('movingModule');
    let connectingFromPort = this.get('connectingFromPort');
    if(mouseListenerAdded && !movingModule && !connectingFromPort) {
      Ember.$(document).off('mousemove');
      this.set('mouseListenerAdded', false);
    }
    
  },

  //callback for mousemove on body
  mouseMoveBody(event) {
    event.preventDefault();
    if(this.get('movingModule') || this.get('connectingFromPort')) {
      this.drawConnections(event);
    }
  },

  //if a connection is selected when the delete key is pressed, send disconnect action
  keyDown(event) {
    if(event.keyCode === 8) {
      let i = this.get('selectedConnectionIndex');
      if(i != null) {
        event.preventDefault();
        let con = this.get('connections').toArray().objectAt(i);
        this.sendAction('removeConnection', con.inPort, con.outPort);
        this.set('selectedConnectionIndex', null);
      }
    }
  },

  //deselect selected connection on blur
  focusOut() {
    let selection = this.get('selectedConnectionIndex');
    if( selection != null ) {
      this.set('selectedConnectionIndex', null);
      this.drawConnections();
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

    var startX, startY, endX, endY;

    let connections = this.get('connections');
    connections.forEach(function(con, index){

      startX = Ember.$(con.outPortDom).offset().left + Ember.$(con.outPortDom).outerWidth()/2;
      startY = Ember.$(con.outPortDom).offset().top + Ember.$(con.outPortDom).outerHeight()/2;
      endX = Ember.$(con.inPortDom).offset().left + Ember.$(con.inPortDom).outerWidth()/2;
      endY = Ember.$(con.inPortDom).offset().top + Ember.$(con.inPortDom).outerHeight()/2; 

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'black';
      if(newPort) {
        ctx.strokeStyle = '#bbb';
      } else if (index === this.get('selectedConnectionIndex')) {
        ctx.strokeStyle = 'red';
      }
      ctx.stroke();

    }, this);

    //drawing a line from selected port to current mouse drag position
    if(newPort && event) {
      startX = Ember.$(newPort).offset().left + Ember.$(newPort).outerWidth()/2;
      startY = Ember.$(newPort).offset().top + Ember.$(newPort).outerHeight()/2;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(event.pageX, event.pageY);
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }

  },

  // Check if mouse position is close to any connection line
  // http://jsfiddle.net/mmansion/9K5p9/

  mouseDown(event) {
    console.log('patch diagram mouse down');
    this.set('selectedConnectionIndex', null);
    var startX, startY, endX, endY, point, lineStart, lineEnd, distance;
    let cons = this.get('connections');
    cons.forEach(function(con, index){

      //todo: should cache this stuff instead of re-jquerying it
      startX = Ember.$(con.outPortDom).offset().left + Ember.$(con.outPortDom).outerWidth()/2;
      startY = Ember.$(con.outPortDom).offset().top + Ember.$(con.outPortDom).outerHeight()/2;
      endX = Ember.$(con.inPortDom).offset().left + Ember.$(con.inPortDom).outerWidth()/2;
      endY = Ember.$(con.inPortDom).offset().top + Ember.$(con.inPortDom).outerHeight()/2; 

      point = {x: event.pageX, y: event.pageY };
      lineStart = {x: startX, y: startY };
      lineEnd = {x: endX, y: endY };

      distance = this.distToSegment(point, lineStart, lineEnd);

      if(distance < 5) {
        this.set('selectedConnectionIndex', index);
      }

    }, this);

    this.drawConnections();

  },

  // Functions to hittest mouse position and patch connections
  // http://jsfiddle.net/mmansion/9K5p9/

  sqr(x) { 
      return x * x;
  },

  dist2(v, w) { 
      return this.sqr(v.x - w.x) + this.sqr(v.y - w.y);
  },

  distToSegmentSquared(p, v, w) {
    var l2 = this.dist2(v, w);
      
    if (l2 === 0) { return this.dist2(p, v); }

    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
      
    if (t < 0) { return this.dist2(p, v); }
    if (t > 1) { return this.dist2(p, w); }
      
    return this.dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
  },

  distToSegment(p, v, w) { 
      return Math.sqrt(this.distToSegmentSquared(p, v, w));
  },
  

});
