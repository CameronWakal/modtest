import Ember from 'ember';

const {
  Component,
  $,
  observer,
  run
} = Ember;

const eventLineColor = '#e8927d';
const valueLineColor = '#61d193';
const selectedLineColor = '#d4f0f7';

export default Component.extend({
  classNames: ['patch-diagram'],
  attributeBindings: ['tabindex'],
  tabindex: -1,
  tagName: 'canvas',

  connections: [],
  selectedConnectionIndex: null,
  newConnectionFrom: null,

  mouseListenerAdded: false,

  didInsertElement() {
    this.onPortsChanged();
    $(window).on('resize', run.bind(this, this.drawConnections));
  },

  onMovingModuleChanged: observer('movingModule', function() {
    if (this.get('movingModule')) {
      this.addMouseListener();
    } else {
      this.removeMouseListener();
    }
  }),

  onConnectingFromPortChanged: observer('connectingFromPort', function() {
    if (this.get('connectingFromPort')) {
      run.scheduleOnce('afterRender', this, function() {
        // if this isn't scheduled, the ember classNameBindings don't get updated
        // in time to be used by this function.
        this.addNewConnection();
      });
    } else {
      this.removeNewConnection();
    }
  }),

  // flag changes to true when controller wants diagram to update list of ports
  onPortsChanged: observer('needsUpdate', function() {
    if (this.get('needsUpdate')) {
      run.scheduleOnce('afterRender', this, function() {
        this.updateConnections();
        this.drawConnections();
        this.attrs.didUpdate();
      });
    }
  }),

  // search for connected ports in dom and store the jquery objects
  // so we can draw connections between ports later.
  updateConnections() {
    let outPorts, inPorts, outPortDom, inPortDom;

    let modulesDom = this.$().siblings('#modules').children();
    let modules = this.get('patch.modules');
    this.set('connections', []);
    let self = this;

    modules.forEach((module) => {

      outPorts = module.get('outPorts');
      outPorts.forEach((outPort) => {

        outPortDom = $(modulesDom).find(`.${outPort.get('uniqueCssIdentifier')}`);

        inPorts = outPort.get('connections');
        inPorts.forEach((inPort) => {

          inPortDom = $(modulesDom).find(`.${inPort.get('uniqueCssIdentifier')}`);
          self.get('connections').addObject({
            inPortDom,
            outPortDom,
            inPort,
            outPort
          });
        });
      });
    });
  },

  // start drawing a line from the new connection port to the cursor location on mouse move
  addNewConnection() {
    let module = this.$().siblings('#modules').children('.port-connecting-from');
    let port = $(module).children('.module-ports').children('.connecting-from');
    this.addMouseListener();
    this.set('newConnectionFrom', port);
    this.drawConnections();
  },

  // stop drawing from the new connection port to the cursor location
  removeNewConnection() {
    this.set('newConnectionFrom', null);
    this.removeMouseListener();
    this.drawConnections();
  },

  // add a mouse listener if it isn't already set
  addMouseListener() {
    let mouseListenerAdded = this.get('mouseListenerAdded');
    if (!mouseListenerAdded) {
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
      this.set('mouseListenerAdded', true);
    }
  },

  // remove the mouse listener only if there is neither a moving module or a connecting port
  removeMouseListener() {
    let mouseListenerAdded = this.get('mouseListenerAdded');
    let movingModule = this.get('movingModule');
    let connectingFromPort = this.get('connectingFromPort');
    if (mouseListenerAdded && !movingModule && !connectingFromPort) {
      $(document).off('mousemove');
      this.set('mouseListenerAdded', false);
    }

  },

  // callback for mousemove on body
  mouseMoveBody(event) {
    event.preventDefault();
    if (this.get('movingModule') || this.get('connectingFromPort')) {
      this.drawConnections(event);
    }
  },

  // if a connection is selected when the delete key is pressed, send disconnect action
  keyDown(event) {
    if (event.keyCode === 8) {
      let i = this.get('selectedConnectionIndex');
      if (i != null) {
        event.preventDefault();
        let con = this.get('connections').toArray().objectAt(i);
        this.sendAction('removeConnection', con.inPort, con.outPort);
        this.set('selectedConnectionIndex', null);
      }
    }
  },

  // deselect selected connection on blur
  focusOut() {
    let selection = this.get('selectedConnectionIndex');
    if (selection != null) {
      this.set('selectedConnectionIndex', null);
      this.drawConnections();
    }
  },

  // draw connections between ports,
  // draw line from new connection port to cursor position
  drawConnections(event) {
    let newPort = this.get('newConnectionFrom');

    let c = this.$().get(0);
    let ctx = c.getContext('2d');
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.lineWidth = 1;

    let startX, startY, endX, endY;

    let connections = this.get('connections');
    connections.forEach((con, index) => {

      startX = $(con.outPortDom).offset().left + $(con.outPortDom).outerWidth() / 2;
      startY = $(con.outPortDom).offset().top + $(con.outPortDom).outerHeight() / 2;
      endX = $(con.inPortDom).offset().left + $(con.inPortDom).outerWidth() / 2;
      endY = $(con.inPortDom).offset().top + $(con.inPortDom).outerHeight() / 2;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.lineWidth = 1;
      if (con.inPort.get('type') === 'port-event-in' || con.inPort.get('type') === 'port-event-out') {
        ctx.strokeStyle = eventLineColor;
      } else {
        ctx.strokeStyle = valueLineColor;
      }
      if (index === this.get('selectedConnectionIndex')) {
        // style for a selected connection
        ctx.strokeStyle = selectedLineColor;
      }
      ctx.stroke();

    }, this);

    // drawing a line from selected port to current mouse drag position
    if (newPort && event) {
      startX = $(newPort).offset().left + $(newPort).outerWidth() / 2;
      startY = $(newPort).offset().top + $(newPort).outerHeight() / 2;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(event.pageX, event.pageY);
      ctx.strokeStyle = selectedLineColor;
      ctx.stroke();
    }

  },

  // Check if mouse position is close to any connection line
  // http://jsfiddle.net/mmansion/9K5p9/

  mouseDown(event) {
    this.set('selectedConnectionIndex', null);
    let startX, startY, endX, endY, point, lineStart, lineEnd, distance;
    let cons = this.get('connections');
    cons.forEach((con, index) => {

      // todo: should cache this stuff instead of re-jquerying it
      startX = $(con.outPortDom).offset().left + $(con.outPortDom).outerWidth() / 2;
      startY = $(con.outPortDom).offset().top + $(con.outPortDom).outerHeight() / 2;
      endX = $(con.inPortDom).offset().left + $(con.inPortDom).outerWidth() / 2;
      endY = $(con.inPortDom).offset().top + $(con.inPortDom).outerHeight() / 2;

      point = { x: event.pageX, y: event.pageY };
      lineStart = { x: startX, y: startY };
      lineEnd = { x: endX, y: endY };

      distance = this.distToSegment(point, lineStart, lineEnd);

      if (distance < 5) {
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
    let l2 = this.dist2(v, w);

    if (l2 === 0) {
      return this.dist2(p, v);
    }

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;

    if (t < 0) {
      return this.dist2(p, v);
    }
    if (t > 1) {
      return this.dist2(p, w);
    }

    return this.dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
  },

  distToSegment(p, v, w) {
    return Math.sqrt(this.distToSegmentSquared(p, v, w));
  }

});
