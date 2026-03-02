import Component from '@glimmer/component';

export default class ModuleArrayComponent extends Component {
  get latestTriggerTime() {
    return this.args.module.latestTriggerTime;
  }

  get triggerDuration() {
    return this.args.module.triggerDuration;
  }

  // Note: observer was removed - Phase 8 will address this with @tracked
  // onLayoutChanged: observer('module.steps.length', 'module.inputType', 'module.displayScale', ...)
}
