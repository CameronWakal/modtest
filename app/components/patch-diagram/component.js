import Component from '@ember/component';
import $ from 'jquery';
import { run } from '@ember/runloop';
import { set, get, observer } from '@ember/object';

const eventLineColor = '#ffd37b';
const valueLineColor = '#ff917b';
const selectedLineColor = '#fff';

export default Component.extend({
  classNames: ['patch-diagram'],
  attributeBindings: ['tabindex'],
  tabindex: -1,
  tagName: 'canvas',

  connections: null,
  selectedConnectionIndex: null,
  newConnectionFrom: null,

  mouseListenerAdded: false,

  onMovingModuleChanged: observer('movingModule', function() {
    if (get(this, 'movingModule')) {
      this.addMouseListener();
    } else {
      this.removeMouseListener();
    }
  }),

  onConnectingFromPortChanged: observer('connectingFromPort', function() {
    if (get(this, 'connectingFromPort')) {
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
    if (get(this, 'needsUpdate')) {
      run.scheduleOnce('afterRender', this, function() {
        this.updateConnections();
        this.drawConnections();
        this.attrs.didUpdate();
      });
    }
  }),

  didInsertElement() {
    this.connections = [];
    this.onPortsChanged();
    $(window).on('resize', run.bind(this, this.drawConnections));
  },

  // search for connected ports in dom and store the jquery objects
  // so we can draw connections between ports later.
  updateConnections() {
    let outPorts, inPorts, outPortDom, inPortDom;

    let modulesDom = this.$().siblings('#modules').children();
    let modules = get(this, 'patch.modules');
    set(this, 'connections', []);
    let self = this;

    modules.forEach((module) => {

      outPorts = get(module, 'outPorts');
      outPorts.forEach((outPort) => {

        outPortDom = $(modulesDom).find(`.${get(outPort, 'uniqueCssIdentifier')}`);

        inPorts = get(outPort, 'connections');
        inPorts.forEach((inPort) => {

          inPortDom = $(modulesDom).find(`.${get(inPort, 'uniqueCssIdentifier')}`);
          get(self, 'connections').addObject({
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
    set(this, 'newConnectionFrom', port);
    this.drawConnections();
  },

  // stop drawing from the new connection port to the cursor location
  removeNewConnection() {
    set(this, 'newConnectionFrom', null);
    this.removeMouseListener();
    this.drawConnections();
  },

  // add a mouse listener if it isn't already set
  addMouseListener() {
    let mouseListenerAdded = get(this, 'mouseListenerAdded');
    if (!mouseListenerAdded) {
      $(document).on('mousemove', this.mouseMoveBody.bind(this));
      set(this, 'mouseListenerAdded', true);
    }
  },

  // remove the mouse listener only if there is neither a moving module or a connecting port
  removeMouseListener() {
    let mouseListenerAdded = get(this, 'mouseListenerAdded');
    let movingModule = get(this, 'movingModule');
    let connectingFromPort = get(this, 'connectingFromPort');
    if (mouseListenerAdded && !movingModule && !connectingFromPort) {
      $(document).off('mousemove');
      set(this, 'mouseListenerAdded', false);
    }

  },

  // callback for mousemove on body
  mouseMoveBody(event) {
    event.preventDefault();
    if (get(this, 'movingModule') || get(this, 'connectingFromPort')) {
      this.drawConnections(event);
    }
  },

  // if a connection is selected when the delete key is pressed, send disconnect action
  keyDown(event) {
    if (event.keyCode === 8) {
      let i = get(this, 'selectedConnectionIndex');
      if (i != null) {
        event.preventDefault();
        let con = get(this, 'connections').toArray().objectAt(i);
        get(this, 'removeConnection')(con.inPort, con.outPort);
        set(this, 'selectedConnectionIndex', null);
      }
    }
  },

  // deselect selected connection on blur
  focusOut() {
    let selection = get(this, 'selectedConnectionIndex');
    if (selection != null) {
      set(this, 'selectedConnectionIndex', null);
      this.drawConnections();
    }
  },

  // draw connections between ports,
  // draw line from new connection port to cursor position
  drawConnections(event) {
    let newPort = get(this, 'newConnectionFrom');

    let c = this.$().get(0);
    let ctx = c.getContext('2d');
    let pxRatio = window.devicePixelRatio;
    ctx.canvas.width  = window.innerWidth * pxRatio;
    ctx.canvas.height = window.innerHeight * pxRatio;

    let startX, startY, endX, endY;

    let connections = get(this, 'connections');
    connections.forEach((con, index) => {

      startX = $(con.outPortDom).offset().left + $(con.outPortDom).outerWidth() / 2;
      startY = $(con.outPortDom).offset().top + $(con.outPortDom).outerHeight() / 2;
      endX = $(con.inPortDom).offset().left + $(con.inPortDom).outerWidth() / 2;
      endY = $(con.inPortDom).offset().top + $(con.inPortDom).outerHeight() / 2;

      ctx.beginPath();
      ctx.moveTo(startX * pxRatio, startY * pxRatio);
      ctx.lineTo(endX * pxRatio, endY * pxRatio);
      ctx.lineWidth = 1 * pxRatio;
      if (get(con.inPort, 'type') === 'port-event-in' || get(con.inPort, 'type') === 'port-event-out') {
        ctx.strokeStyle = eventLineColor;
      } else {
        ctx.strokeStyle = valueLineColor;
      }
      if (index === get(this, 'selectedConnectionIndex')) {
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
      ctx.moveTo(startX * pxRatio, startY * pxRatio);
      ctx.lineTo(event.pageX * pxRatio, event.pageY * pxRatio);
      ctx.strokeStyle = selectedLineColor;
      ctx.stroke();
    }

  },

  // Check if mouse position is close to any connection line
  // http://jsfiddle.net/mmansion/9K5p9/
  mouseDown(event) {
    get(this, 'moduleDeselected')();
    set(this, 'selectedConnectionIndex', null);
    let startX, startY, endX, endY, point, lineStart, lineEnd, distance;
    let cons = get(this, 'connections');
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
        set(this, 'selectedConnectionIndex', index);
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
