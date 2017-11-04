import Component from '@ember/component';

export default Component.extend({
  tagName: 'button',

  classNames: ['toggle-button'],
  classNameBindings: ['isOn:toggle-button-on']
});
