import { belongsTo, attr } from '@ember-data/model';
import Module from '../module/model';

export default class ModuleMuteModel extends Module {
  type = 'module-mute'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Mute';

  @attr('boolean', { defaultValue: false }) isMuted;
  @belongsTo('port-event-out', { async: false, inverse: null }) eventOutPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) valueInPort;

  configure() {
    this.addEventInPort('toggle', 'toggle', false);
    this.addEventInPort('mute', 'mute', false);
    this.addEventInPort('unmute', 'unmute', false);
    this.addEventInPort('in', 'eventIn', true);
    this.addValueInPort('in', 'valueInPort', { canBeEmpty: true });
    this.addEventOutPort('out', 'eventOutPort', true);
    this.addValueOutPort('out', 'getValue', true);
  }

  toggle() {
    this.isMuted = !this.isMuted;
  }

  mute() {
    this.isMuted = true;
  }

  unmute() {
    this.isMuted = false;
  }

  eventIn(event) {
    if (!this.isMuted) {
      this.eventOutPort.sendEvent(event);
    }
  }

  getValue() {
    if (!this.isMuted) {
      return this.valueInPort.getValue();
    }
    return null;
  }
}
