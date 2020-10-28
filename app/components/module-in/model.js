import { inject as service } from '@ember/service';
import { computed, observer, set, get } from '@ember/object';
import Module from '../module/model';
import { belongsTo, attr } from '@ember-data/model';

export default Module.extend({

  midi: service(),

  type: 'module-in', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'In',

  note: null,
  velocity: null,

  noteOnPort: belongsTo('port-event-out', { async: false }),
  noteOffPort: belongsTo('port-event-out', { async: false }),

  inputDeviceName: attr('string', { defaultValue: 'All' }),
  deviceMenuOptions: computed('midi.inputDevices', 'inputDeviceName', function() {
    let devices = get(this, 'midi.inputDevices').mapBy('name');
    let currentDevice = this.inputDeviceName;
    if (!devices.includes(currentDevice) && currentDevice !== 'All') {
      devices = [currentDevice, ...devices];
    }
    return ['All', ...devices];
  }),

  onInputDeviceNameChanged: observer('inputDeviceName', function() {
    if (this.hasDirtyAttributes) {
      this.requestSave();
    }
  }),

  getNote() {
    return this.note;
  },

  getVel() {
    return this.velocity;
  },

  noteOn(note, velocity, timestamp) {
    set(this, 'note', note);
    set(this, 'velocity', velocity);

    if (get(this, 'noteOnPort.isConnected')) {
      let event = {
        targetTime: timestamp,
        callbackTime: performance.now()
      };
      this.noteOnPort.sendEvent(event);
    }
  },

  noteOff(note, velocity, timestamp) {
    set(this, 'note', note);
    set(this, 'velocity', velocity);

    if (get(this, 'noteOnPort.isConnected')) {
      let event = {
        targetTime: timestamp,
        callbackTime: performance.now()
      };
      this.noteOffPort.sendEvent(event);
    }
  },

  init() {
    this._super(...arguments);
    this.midi.noteListener = this;

    if (this.isNew) {
      set(this, 'title', this.name);

      // create ports
      this.addEventOutPort('on', 'noteOnPort', true);
      this.addEventOutPort('off', 'noteOffPort', false);
      this.addValueOutPort('note', 'getNote', true);
      this.addValueOutPort('vel', 'getVel', true);

      // create settings
      this.addMenuSetting('Input', 'inputDeviceName', 'deviceMenuOptions', this);

      console.log('module-in.didCreate() requestSave()');
      this.requestSave();
    }
  },

  remove() {
    this.midi.noteListener = null;
    this._super();
  }

});
