import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ModuleClockComponent extends Component {
  @action
  start() {
    this.args.module.start();
  }

  @action
  stop() {
    this.args.module.stop();
  }
}
