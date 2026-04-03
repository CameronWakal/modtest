import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ModuleAnalystComponent extends Component {
  @action
  selectKey(index) {
    this.args.module.setSelectedKey(index);
  }
}
