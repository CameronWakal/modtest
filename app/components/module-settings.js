import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ModuleSettingsComponent extends Component {
  @action
  titleChanged() {
    this.args.module.requestSave();
  }
}
