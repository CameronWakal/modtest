import Component from '@glimmer/component';
import { action, set } from '@ember/object';

export default class ModuleSettingMenu extends Component {

  @action
  settingChanged(event) {
    let selectedIndex = event.target.selectedIndex;
    set(this, 'args.setting.value', this.args.setting.items[selectedIndex]);
  }

}
