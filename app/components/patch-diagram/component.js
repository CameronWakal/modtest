import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

const eventLineColor = '#ffd37b';
const valueLineColor = '#ff917b';
const selectedLineColor = '#fff';

export default class PatchDiagramComponent extends Component {
  @tracked connections = [];
  @tracked selectedConnectionIndex = null;
  @tracked newConnectionFrom = null;

  canvasElement = null;
  mouseMoveBodyFunction = null;
  previousMovingModule = null;
  previousConnectingFromPort = null;
  previousNeedsUpdate = null;

  constructor() {
    super(...arguments);
    this.mouseMoveBodyFunction = this.mouseMoveBody.bind(this);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.mouseMoveBodyFunction) {
      document.removeEventListener('mousemove', this.mouseMoveBodyFunction);
    }
    window.onresize = null;
  }

  @action
  setupCanvas(element) {
    this.canvasElement = element;
    window.onresize = () => this.drawConnections();
    // Initialize previous values and check for initial updates
    this.previousNeedsUpdate = this.args.needsUpdate;
    this.previousMovingModule = this.args.movingModule;
    this.previousConnectingFromPort = this.args.connectingFromPort;
    // Initial draw if needsUpdate is true
    if (this.args.needsUpdate) {
      scheduleOnce('afterRender', this, this.updateAndDraw);
    }
  }

  @action
  checkForUpdates() {
    // Check if movingModule changed
    if (this.args.movingModule !== this.previousMovingModule) {
      this.previousMovingModule = this.args.movingModule;
      if (this.args.movingModule) {
        this.addMouseListener();
      } else {
        this.removeMouseListener();
      }
    }

    // Check if connectingFromPort changed
    if (this.args.connectingFromPort !== this.previousConnectingFromPort) {
      this.previousConnectingFromPort = this.args.connectingFromPort;
      if (this.args.connectingFromPort) {
        scheduleOnce('afterRender', this, this.addNewConnection);
      } else {
        this.removeNewConnection();
      }
    }

    // Check if needsUpdate changed to true
    if (this.args.needsUpdate && !this.previousNeedsUpdate) {
      scheduleOnce('afterRender', this, this.updateAndDraw);
    }
    this.previousNeedsUpdate = this.args.needsUpdate;
  }

  updateAndDraw() {
    this.updateConnections();
    this.drawConnections();
    this.args.didUpdate();
  }

  // Build list of connections from port models.
  // DOM elements are queried fresh during drawConnections to handle timing issues.
  updateConnections() {
    let modules = this.args.patch?.modules || [];
    this.connections = [];

    modules.forEach((module) => {
      let outPorts = module.enabledOutPorts || [];
      outPorts.forEach((outPort) => {
        let inPorts = outPort.connections || [];
        inPorts.forEach((inPort) => {
          this.connections.push({
            inPort,
            outPort
          });
        });
      });
    });
  }

  // Get DOM element for a port by its unique CSS identifier
  getPortElement(port) {
    if (!port || !port.uniqueCssIdentifier) {
      return null;
    }
    let modulesDom = document.getElementById('modules');
    if (!modulesDom) {
      return null;
    }
    return modulesDom.getElementsByClassName(port.uniqueCssIdentifier)[0];
  }

  // start drawing a line from the new connection port to the cursor location on mouse move
  addNewConnection() {
    let port = this.args.connectingFromPort;
    if (!port) {
      return;
    }
    let portElement = this.getPortElement(port);
    this.addMouseListener();
    this.newConnectionFrom = portElement;
    this.drawConnections();
  }

  // stop drawing from the new connection port to the cursor location
  removeNewConnection() {
    this.newConnectionFrom = null;
    this.removeMouseListener();
    this.drawConnections();
  }

  // add a mouse listener if it isn't already set
  addMouseListener() {
    if (!this._mouseListenerActive) {
      this._mouseListenerActive = true;
      document.addEventListener('mousemove', this.mouseMoveBodyFunction);
    }
  }

  // remove the mouse listener only if there is neither a moving module or a connecting port
  removeMouseListener() {
    if (this._mouseListenerActive && !this.args.movingModule && !this.args.connectingFromPort) {
      document.removeEventListener('mousemove', this.mouseMoveBodyFunction);
      this._mouseListenerActive = false;
    }
  }

  // callback for mousemove on body
  mouseMoveBody(event) {
    event.preventDefault();
    if (this.args.movingModule || this.args.connectingFromPort) {
      this.drawConnections(event);
    }
  }

  @action
  handleMouseDown(event) {
    this.args.moduleDeselected();
    this.selectedConnectionIndex = null;
    let start, end, point, distance;

    this.connections.forEach((con, index) => {
      // Query DOM elements fresh
      let outPortDom = this.getPortElement(con.outPort);
      let inPortDom = this.getPortElement(con.inPort);

      if (!outPortDom || !inPortDom) {
        return;
      }

      start = this.portElementCenter(outPortDom);
      end = this.portElementCenter(inPortDom);
      point = { x: event.pageX, y: event.pageY };

      distance = this.distToSegment(point, start, end);

      if (distance < 5) {
        this.selectedConnectionIndex = index;
      }
    });

    this.drawConnections();
  }

  // if a connection is selected when the delete key is pressed, send disconnect action
  @action
  handleKeyDown(event) {
    if (event.keyCode === 8) {
      let i = this.selectedConnectionIndex;
      if (i != null) {
        event.preventDefault();
        let con = this.connections[i];
        this.args.removeConnection(con.inPort, con.outPort);
        this.selectedConnectionIndex = null;
      }
    }
  }

  // deselect selected connection on blur
  @action
  handleFocusOut() {
    if (this.selectedConnectionIndex != null) {
      this.selectedConnectionIndex = null;
      this.drawConnections();
    }
  }

  // draw connections between ports,
  // draw line from new connection port to cursor position
  drawConnections(event) {
    if (!this.canvasElement) {
      return;
    }

    let newPort = this.newConnectionFrom;

    let ctx = this.canvasElement.getContext('2d');
    let pxRatio = window.devicePixelRatio;
    ctx.canvas.width = window.innerWidth * pxRatio;
    ctx.canvas.height = window.innerHeight * pxRatio;

    let start, end;

    this.connections.forEach((con, index) => {
      // Query DOM elements fresh each time
      let outPortDom = this.getPortElement(con.outPort);
      let inPortDom = this.getPortElement(con.inPort);

      // Skip if DOM elements not found
      if (!outPortDom || !inPortDom) {
        return;
      }

      start = this.portElementCenter(outPortDom);
      end = this.portElementCenter(inPortDom);

      ctx.beginPath();
      ctx.moveTo(start.x * pxRatio, start.y * pxRatio);
      ctx.lineTo(end.x * pxRatio, end.y * pxRatio);
      ctx.lineWidth = 1 * pxRatio;
      if (con.inPort.type === 'port-event-in' || con.inPort.type === 'port-event-out') {
        ctx.strokeStyle = eventLineColor;
      } else {
        ctx.strokeStyle = valueLineColor;
      }
      if (index === this.selectedConnectionIndex) {
        // style for a selected connection
        ctx.strokeStyle = selectedLineColor;
      }
      ctx.stroke();
    });

    // drawing a line from selected port to current mouse drag position
    if (newPort && event) {
      start = this.portElementCenter(newPort);

      ctx.beginPath();
      ctx.moveTo(start.x * pxRatio, start.y * pxRatio);
      ctx.lineTo(event.pageX * pxRatio, event.pageY * pxRatio);
      ctx.strokeStyle = selectedLineColor;
      ctx.stroke();
    }
  }

  portElementCenter(port) {
    let x = port.offsetLeft + port.parentElement.parentElement.offsetLeft + port.offsetWidth / 2;
    let y = port.offsetTop + port.parentElement.parentElement.offsetTop + port.offsetHeight / 2;
    return { x, y };
  }

  // Functions to hittest mouse position and patch connections
  // http://jsfiddle.net/mmansion/9K5p9/

  sqr(x) {
    return x * x;
  }

  dist2(v, w) {
    return this.sqr(v.x - w.x) + this.sqr(v.y - w.y);
  }

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
  }

  distToSegment(p, v, w) {
    return Math.sqrt(this.distToSegmentSquared(p, v, w));
  }
}
