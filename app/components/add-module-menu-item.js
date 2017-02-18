import Ember from 'ember';

const {
  get,
  set
} = Ember;

export default Ember.Component.extend({

  tagName: 'a',
  classNames: ['add-module-menu-item'],
  attributeBindings: ['href'],
  href: '#',

  mouseIsDown: false,

  mouseDown() {
    set(this, 'mouseIsDown', true);
    return false;
  },

  mouseUp() {
    set(this, 'mouseIsDown', false);
  },

  mouseMove(event) {
    if (get(this, 'mouseIsDown')) {
      this.sendAction('addModule', get(this, 'moduleType'), event);
      set(this, 'mouseIsDown', false);
    }
  }

});
