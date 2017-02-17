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
  isDragging: false,

  mouseDown() {
    set(this, 'mouseIsDown', true);
    return false;
  },

  mouseUp() {
    set(this, 'mouseIsDown', false);
    set(this, 'isDragging', false);
  },

  mouseMove(event) {
    if (get(this, 'mouseIsDown') && !get(this, 'isDragging')) {
      this.sendAction('addModule', get(this, 'moduleType'), event);
      set(this, 'isDragging', true);
    }
  },

});
