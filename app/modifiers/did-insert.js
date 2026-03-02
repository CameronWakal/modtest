import Modifier from 'ember-modifier';

export default class DidInsertModifier extends Modifier {
  didSetup = false;

  modify(element, [callback, ...args]) {
    if (!this.didSetup) {
      this.didSetup = true;
      callback(element, ...args);
    }
  }
}
