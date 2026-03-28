import { tracked } from '@glimmer/tracking';
import { belongsTo } from '@ember-data/model';
import Module from '../module/model';
import { mod } from '../../utils/math-util';

export default class ModuleClockDivModel extends Module {
  type = 'module-clock-div'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Clock Div';

  // Receives input events and sends an output on the first event, and then every nth event after,
  // n being divBy. If a shiftBy value is provided, the output event will be shifted later by that
  // many input events. If shiftBy is greater than divBy, the shift value will be shiftBy%divBy.
  // A resetIn does not cause an out event, it just resets the module for the next clockIn.

  count = 0;
  @tracked latestTriggerTime = null;
  @tracked triggerDuration = null;

  @belongsTo('port-value-in', { async: false, inverse: null }) divByPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) shiftByPort;
  @belongsTo('port-event-out', { async: false, inverse: null }) trigOutPort;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      this.addEventInPort('clock', 'onClockIn', true);
      this.addEventInPort('reset', 'onResetIn', false);

      this.addValueInPort('div', 'divByPort', { isEnabled: false, defaultValue: 6, minValue: 1 });
      this.addValueInPort('shift', 'shiftByPort', { isEnabled: false, defaultValue: 0 });

      this.addEventOutPort('trig', 'trigOutPort', true);
      console.log('module-clock-div.didCreate() requestSave()');
      this.requestSave();
    }
  }

  onClockIn(event) {
    let count = this.count;
    let divBy = this.divByPort.getValue();
    let shiftBy = this.shiftByPort.getValue();

    if (count - mod(shiftBy, divBy) === 0) {
      if (this.trigOutPort?.isConnected) {
        // Since we're changing the event duration, make a copy to avoid side effects
        let newEvent = Object.assign({}, event);
        newEvent.duration *= divBy;
        this.triggerDuration = newEvent.duration;
        this.latestTriggerTime = newEvent.targetTime;
        this.trigOutPort.sendEvent(newEvent);
      }
    }

    this.count = mod(count + 1, divBy);
  }

  onResetIn() {
    this.count = 0;
  }
}
