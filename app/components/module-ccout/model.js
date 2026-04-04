import { service } from '@ember/service';
import Module from '../module/model';
import { belongsTo } from '@ember-data/model';

export default class ModuleCcoutModel extends Module {
  @service midi;

  type = 'module-ccout'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'CC Out';

  @belongsTo('port-value-in', { async: false, inverse: null }) controlInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) channelInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) valueInPort;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      // create ports
      this.addEventInPort('trig', 'sendEvent', true);

      this.addValueInPort('control', 'controlInPort', { isEnabled: false, canBeEmpty: true, defaultValue: 0, minValue: 0, maxValue: 127 });
      this.addValueInPort('channel', 'channelInPort', { isEnabled: false, defaultValue: 0, minValue: 0, maxValue: 15 });
      this.addValueInPort('value', 'valueInPort', { canBeEmpty: true, minValue: 0, maxValue: 127 });
    }
  }

  sendEvent() {
    // check the connection of the 'note' port for the value of the note to play.
    let value = this.valueInPort.getValue();
    let control = this.controlInPort.getValue();
    if (value != null && control != null) {
      let channel = this.channelInPort.getValue();
      this.midi.sendCC(control, value, channel);
    }
  }
}
