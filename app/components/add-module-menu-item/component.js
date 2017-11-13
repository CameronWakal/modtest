import { set, get } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

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
      get(this, 'addModule')(get(this, 'moduleType'), event);
      set(this, 'mouseIsDown', false);
    }
  }

});
