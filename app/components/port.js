import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PortComponent extends Component {
  @tracked isConnectingFrom = false;

  // Store bound reference for cleanup
  _mouseUpBodyHandler = null;

  // Subclasses should override this getter to add their specific classes
  get portTypeClasses() {
    return '';
  }

  get portClasses() {
    const classes = ['port', this.portTypeClasses];
    if (this.args.port?.isConnected) {
      classes.push('connected');
    }
    if (this.isConnectingFrom) {
      classes.push('connecting-from');
    }
    if (this.args.port?.uniqueCssIdentifier) {
      classes.push(this.args.port.uniqueCssIdentifier);
    }
    return classes.filter(Boolean).join(' ');
  }

  @action
  handleMouseDown(event) {
    event.preventDefault();
    event.currentTarget.focus();
    this.isConnectingFrom = true;
    this._mouseUpBodyHandler = this._handleMouseUpBody.bind(this, event.currentTarget);
    document.addEventListener('mouseup', this._mouseUpBodyHandler);
    this.args.startedConnecting?.(event);
    return false;
  }

  _handleMouseUpBody(element, event) {
    event.preventDefault();
    element.blur();
    this.isConnectingFrom = false;
    this.args.finishedConnecting?.();
    document.removeEventListener('mouseup', this._mouseUpBodyHandler);
  }

  @action
  handleMouseEnter() {
    this.args.handleMouseEnter?.();
  }

  @action
  handleMouseLeave() {
    this.args.handleMouseLeave?.();
  }
}
