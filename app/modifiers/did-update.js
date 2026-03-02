import Modifier from 'ember-modifier';

export default class DidUpdateModifier extends Modifier {
  modify(element, [callback, ...args]) {
    // Call callback on every update (including first render)
    callback(element, ...args);
  }
}
