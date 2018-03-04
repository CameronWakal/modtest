import Component from '@ember/component';
import $ from 'jquery';
import { run } from '@ember/runloop';
import { set, get, observer } from '@ember/object';

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

  mouseDown(event) {
    event.preventDefault();
    this.$().focus();
    set(this, 'isConnectingFrom', true);
    $(document).on('mouseup', this.mouseUpBody.bind(this));
    get(this, 'startedConnecting')(event);
    return false;
  },

  mouseUpBody(event) {
    event.preventDefault();
    this.$().blur();
    let self = this;
    run(function() {
      set(self, 'isConnectingFrom', false);
      self.sendAction('finishedConnecting');
      $(document).off('mouseup');
    });
  }

});
