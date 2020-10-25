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
    if (this.mouseIsDown) {
      this.addModule(this.moduleType, event);
      set(this, 'mouseIsDown', false);
    }
  },

  didInsertElement() {
    this.element.addEventListener('mousemove', this.handleMouseMove);
  },

  willDestroyElement() {
    this.element.removeEventListener('mousemove', this.handleMouseMove);
  }

});
