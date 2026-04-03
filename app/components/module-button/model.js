import { belongsTo } from '@ember-data/model';
import Module from '../module/model';

export default class ModuleButtonModel extends Module {
  type = 'module-button'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Button';

  @belongsTo('port-event-out', { async: false, inverse: null }) eventOutPort;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;
      // create ports
      this.addEventOutPort('out', 'eventOutPort', true);
    }
  }

  trig() {
    this.eventOutPort.sendEvent({
      targetTime: performance.now(),
      callbackTime: performance.now()
    });
  }
}
