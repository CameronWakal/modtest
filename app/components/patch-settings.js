import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PatchSettingsComponent extends Component {
  @action
  titleChanged() {
    this.args.patchTitleChanged();
  }
}
