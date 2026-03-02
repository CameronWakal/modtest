import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ModuleMuteComponent extends Component {
  @action
  mute() {
    this.args.module.toggleProperty('isMuted');
  }
}
