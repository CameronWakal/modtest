import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default class ModuleWrapperComponent extends Component {
  @tracked isMoving = false;
  @tracked didMove = false;
  @tracked moveOffsetX = null;
  @tracked moveOffsetY = null;
  @tracked portIsConnectingFrom = false;

  mouseUpBodyFunction = null;
  mouseMoveBodyFunction = null;

  constructor() {
    super(...arguments);

    // Save reference to bound functions so removeEventListener will work
    this.mouseUpBodyFunction = this.mouseUpBody.bind(this);
    this.mouseMoveBodyFunction = this.mouseMoveBody.bind(this);

    if (this.args.module.isNew) {
      this.isMoving = true;
      document.addEventListener('mouseup', this.mouseUpBodyFunction);
      document.addEventListener('mousemove', this.mouseMoveBodyFunction);
    } else {
      this.args.module.shouldAutoSave = true;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    document.removeEventListener('mouseup', this.mouseUpBodyFunction);
    document.removeEventListener('mousemove', this.mouseMoveBodyFunction);
  }

  get xPos() {
    return this.args.module.xPos;
  }

  set xPos(value) {
    this.args.module.xPos = value;
  }

  get yPos() {
    return this.args.module.yPos;
  }

  set yPos(value) {
    this.args.module.yPos = value;
  }

  get inlineStyles() {
    let styleString = `left:${this.xPos}px; top:${this.yPos}px`;
    return htmlSafe(styleString);
  }

  get cssClasses() {
    let classes = ['module', this.args.module.type];
    if (this.portIsConnectingFrom) {
      classes.push('port-connecting-from');
    }
    if (this.args.module.isNew) {
      classes.push('is-new');
    }
    if (this.args.additionalClasses) {
      classes.push(this.args.additionalClasses);
    }
    return classes.join(' ');
  }

  @action
  portStartedConnecting(port) {
    this.portIsConnectingFrom = true;
    if (this.args.modulePortStartedConnecting) {
      this.args.modulePortStartedConnecting(port);
    }
  }

  @action
  portFinishedConnecting() {
    this.portIsConnectingFrom = false;
    if (this.args.modulePortFinishedConnecting) {
      this.args.modulePortFinishedConnecting();
    }
  }

  @action
  mouseEnterPort(port) {
    if (this.args.mouseEnterModulePort) {
      this.args.mouseEnterModulePort(port);
    }
  }

  @action
  mouseLeavePort(port) {
    if (this.args.mouseLeaveModulePort) {
      this.args.mouseLeaveModulePort(port);
    }
  }

  @action
  disconnectPort(port) {
    port.disconnect();
    if (this.args.portDisconnected) {
      this.args.portDisconnected(port);
    }
  }

  @action
  handleMouseDown(event) {
    if (event.target.classList.contains('module')
      || event.target.classList.contains('module-label')
      || event.target.classList.contains('module-ports')
      || event.target.classList.contains('indicator-blinking')
    ) {
      this.isMoving = true;
      this.moveOffsetX = event.pageX - this.xPos;
      this.moveOffsetY = event.pageY - this.yPos;
      document.addEventListener('mouseup', this.mouseUpBodyFunction);
      document.addEventListener('mousemove', this.mouseMoveBodyFunction);
      if (this.args.selected) {
        this.args.selected();
      }
      if (this.args.startedMoving) {
        this.args.startedMoving();
      }
    }
  }

  @action
  handleKeyDown(event) {
    if (event.keyCode === 8 && event.target === event.currentTarget) {
      event.preventDefault();
      if (this.args.remove) {
        this.args.remove();
      }
    }
  }

  mouseMoveBody(event) {
    event.preventDefault();
    this.didMove = true;

    if (this.moveOffsetX == null) {
      this.moveOffsetX = event.pageX - this.xPos;
    }
    if (this.moveOffsetY == null) {
      this.moveOffsetY = event.pageY - this.yPos;
    }

    this.xPos = event.pageX - this.moveOffsetX;
    this.yPos = event.pageY - this.moveOffsetY;
  }

  mouseUpBody(event) {
    event.preventDefault();
    this.isMoving = false;

    if (this.didMove) {
      if (this.args.module.isNew) {
        this.args.module.shouldAutoSave = true;
        if (this.args.savePatch) {
          this.args.savePatch();
        }
      }

      this.args.module.requestSave();
      this.didMove = false;
    }

    if (this.args.finishedMoving) {
      this.args.finishedMoving();
    }
    document.removeEventListener('mouseup', this.mouseUpBodyFunction);
    document.removeEventListener('mousemove', this.mouseMoveBodyFunction);
  }
}
