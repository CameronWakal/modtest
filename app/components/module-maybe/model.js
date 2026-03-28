import { belongsTo } from '@ember-data/model';
import Module from '../module/model';

export default class ModuleMaybeModel extends Module {
  type = 'module-maybe'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Maybe';

  @belongsTo('port-event-in', { async: false, inverse: null }) eventInPort;
  @belongsTo('port-event-out', { async: false, inverse: null }) eventOutPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) numeratorInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) denominatorInPort;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      // Create ports
      this.addEventInPort('in', 'onEventIn', true);
      this.addEventOutPort('out', 'eventOutPort', true);

      this.addValueInPort('numerator', 'numeratorInPort', { defaultValue: 1, minValue: 0, isEnabled: false });
      this.addValueInPort('denominator', 'denominatorInPort', { defaultValue: 2, minValue: 1, isEnabled: false });

      console.log('module-maybe.didCreate() requestSave()');
      this.requestSave();
    }
  }

  onEventIn(event) {
    let numerator = this.numeratorInPort.getValue();
    let denominator = this.denominatorInPort.getValue();

    let prob = numerator / denominator;
    let rand = Math.random();

    if (rand <= prob) {
      this.eventOutPort.sendEvent(event);
    }
  }
}
