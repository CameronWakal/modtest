import { get, action } from '@ember/object';
import ValueInputNumber from '../value-input-number/component';

// like ValueInputNumber, but meant to be used as one of many inputs in an array:
// - can be styled based on whether it's the currently active item in the series
// - supports shortcuts to shift or modify all items in the array
// - supports key events to navigate focus between items in the array

export default class ValueArrayInputNumber extends ValueInputNumber {

  //classNameBindings: ['item.isCurrentItem:current'],

  selectNext(currentElement) {
    if (currentElement.nextElementSibling) {
      currentElement.nextElementSibling.focus();
    } else {
      currentElement.parentElement.firstElementChild.focus();
    }
  };

  selectPrevious(currentElement) {
    if (currentElement.previousElementSibling) {
      console.log('prevsiblingvalue', currentElement.previousElementSibling.value);
      currentElement.previousElementSibling.focus();
    } else {
      currentElement.parentElement.lastElementChild.focus();
    }
  };

  @action
  keyUp(event) {

    switch (event.keyCode) {
      case 37: // left arrow
        event.target.select();
        break;
      case 39: // right arrow
        event.target.select();
        break;
      default:
        super.keyUp(event);
    }
  };

  @action
  keyDown(event) {

    switch (event.keyCode) {
      case 37: // left arrow
        if (event.shiftKey) {
          console.log("items1", get(this, 'args.item.array.items').mapBy('value'));
          this.commitValue();
          get(this, 'args.item.array').shiftForward();
          console.log("items3", get(this, 'args.item.array.items').mapBy('value'));
        }
        this.selectPrevious(event.target);
        console.log("items4", get(this, 'args.item.array.items').mapBy('value'));
        break;
      case 39: // right arrow
        if (event.shiftKey) {
          this.commitValue();
          get(this, 'args.item.array').shiftBackward();
        }
        this.selectNext(event.target);
        break;
      case 38: // up arrow
        if (event.shiftKey) {
          this.commitValue();
          get(this, 'args.item.array').incrementAll();
        } else {
          this.updateValue(this.value + 1);
          this.commitValue();
        }
        break;
      case 40: // down arrow
        if (event.shiftKey) {
          this.commitValue();
          get(this, 'args.item.array').decrementAll();
        } else {
          this.updateValue(this.value - 1);
          this.commitValue();
        }
        break;
      default:
        super.keyDown(event);
    }
  };

}
