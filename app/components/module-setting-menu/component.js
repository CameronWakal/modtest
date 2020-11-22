import Component from '@ember/component';
import { action, set } from '@ember/object';

export default Component.extend({
  classNames: ['module-setting', 'module-setting-menu'],

  @action
  settingChanged(event) {
    let selectedIndex = event.target.selectedIndex;
    set(this, 'setting.value', this.setting.items[selectedIndex]);
  }

});
