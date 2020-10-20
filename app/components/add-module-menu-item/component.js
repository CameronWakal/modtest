import { set, get, action } from '@ember/object';
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

  @action
  handleMouseMove(event) {
    if (get(this, 'mouseIsDown')) {
      get(this, 'addModule')(get(this, 'moduleType'), event);
      set(this, 'mouseIsDown', false);
    }
  },

  didInsertElement() {
    //super.didInsertElement(...arguments);
    this.element.addEventListener('mousemove', this.handleMouseMove);
  },

  willDestroyElement() {
    //super.willDestroyElement(...arguments);
    this.element.removeEventListener('mousemove', this.handleMouseMove);
  }

});
