import Component from '@ember/component';
import { run } from '@ember/runloop';
import { set, get } from '@ember/object';

export default Component.extend({
  classNames: ['port'],
  classNameBindings: [
    'port.isConnected:connected',
    'isConnectingFrom:connecting-from',
    'port.uniqueCssIdentifier'
  ],
  attributeBindings: ['tabindex'],
  tabindex: -1,

  isConnectingFrom: false,
  mouseUpBodyFunction: null,

  mouseDown(event) {
    event.preventDefault();
    this.element.focus();
    set(this, 'isConnectingFrom', true);
    this.mouseUpBodyFunction = this.mouseUpBody.bind(this);
    document.addEventListener('mouseup', this.mouseUpBodyFunction);
    get(this, 'startedConnecting')(event);
    return false;
  },

  mouseUpBody(event) {
    event.preventDefault();
    this.element.blur();
    let self = this;
    run(function() {
      set(self, 'isConnectingFrom', false);
      self.finishedConnecting();
      document.removeEventListener('mouseup', self.mouseUpBodyFunction);
    });
  }

});
