import Component from '@glimmer/component';

export default class ModuleInComponent extends Component {
  get latestTriggerTime() {
    return this.args.module.latestTriggerTime;
  }

  get triggerDuration() {
    return this.args.module.triggerDuration;
  }
}
