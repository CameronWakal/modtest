import Component from '@glimmer/component';

export default class ModuleSettingComponent extends Component {
  get titleAttribute() {
    let title = '';
    if (this.args.setting?.minValue != null) {
      title += `min:${this.args.setting.minValue} `;
    }
    if (this.args.setting?.maxValue != null) {
      title += `max:${this.args.setting.maxValue} `;
    }
    return title.trim();
  }
}
