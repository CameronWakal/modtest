import { service } from '@ember/service';
import Module from '../module/model';
import { belongsTo, attr } from '@ember-data/model';

export default class ModuleInModel extends Module {
  @service midi;

  type = 'module-in'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'In';

  note = null;
  velocity = null;

  @belongsTo('port-event-out', { async: false, inverse: null }) noteOnPort;
  @belongsTo('port-event-out', { async: false, inverse: null }) noteOffPort;

  @attr('string', { defaultValue: 'All' }) inputDeviceName;

  get deviceMenuOptions() {
    let devices = this.midi.inputDevices.map(d => d.name);
    let currentDevice = this.inputDeviceName;
    if (!devices.includes(currentDevice) && currentDevice !== 'All') {
      devices = [currentDevice, ...devices];
    }
    return ['All', ...devices];
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    this.midi.noteListener = this;

    if (this.isNew && this.ports.length === 0) {
      this.title = this.name;

      // Create ports
      this.addEventOutPort('on', 'noteOnPort', true);
      this.addEventOutPort('off', 'noteOffPort', false);
      this.addValueOutPort('note', 'getNote', true);
      this.addValueOutPort('vel', 'getVel', true);

      // Create settings
      this.addMenuSetting('Input', 'inputDeviceName', 'deviceMenuOptions', this);
    }
  }

  getNote() {
    return this.note;
  }

  getVel() {
    return this.velocity;
  }

  noteOn(note, velocity, timestamp) {
    this.note = note;
    this.velocity = velocity;

    if (this.noteOnPort?.isConnected) {
      let event = {
        targetTime: timestamp,
        callbackTime: performance.now()
      };
      this.noteOnPort.sendEvent(event);
    }
  }

  noteOff(note, velocity, timestamp) {
    this.note = note;
    this.velocity = velocity;

    if (this.noteOnPort?.isConnected) {
      let event = {
        targetTime: timestamp,
        callbackTime: performance.now()
      };
      this.noteOffPort.sendEvent(event);
    }
  }

  remove() {
    this.midi.noteListener = null;
    super.remove();
  }
}
