import Ember from 'ember';

const {
  Component,
  $,
  observer,
  run,
  isEmpty,
  get,
  set
} = Ember;

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

  onDisable: observer('port.isEnabled', function() {
    if (!get(this, 'port.isEnabled') && !isEmpty(get(this, 'port.connections'))) {
      this.sendAction('disconnect');
    }
  }),

  mouseDown(event) {
    event.preventDefault();
    this.$().focus();
    set(this, 'isConnectingFrom', true);
    $(document).on('mouseup', this.mouseUpBody.bind(this));
    this.sendAction('startedConnecting', event);
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
