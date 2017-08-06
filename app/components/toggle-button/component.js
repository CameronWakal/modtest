import Ember from 'ember';

const {
  Component
} = Ember;

export default Component.extend({
  tagName: 'button',

  classNames: ['toggle-button'],
  classNameBindings: ['isOn:toggle-button-on']
});
