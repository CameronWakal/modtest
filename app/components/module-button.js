import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ModuleButtonComponent extends Component {
  @action
  trig() {
    this.args.module.trig();
  }
}
