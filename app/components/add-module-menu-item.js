import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AddModuleMenuItemComponent extends Component {
  @tracked mouseIsDown = false;

  @action
  handleMouseDown() {
    this.mouseIsDown = true;
  }

  @action
  handleMouseUp() {
    this.mouseIsDown = false;
  }

  @action
  handleMouseMove(event) {
    if (this.mouseIsDown) {
      this.args.addModule(this.args.moduleType, event);
      this.mouseIsDown = false;
    }
  }
}
