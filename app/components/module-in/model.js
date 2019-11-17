import { inject as service } from '@ember/service';
import { computed, observer, set, get } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

const {
  belongsTo,
  attr
} = DS;

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
    let currentDevice = get(this, 'inputDeviceName');
    if (!devices.includes(currentDevice) && currentDevice !== 'All') {
      devices = [currentDevice, ...devices];
    }
    return ['All', ...devices];
  }),

  onInputDeviceNameChanged: observer('inputDeviceName', function() {
    if (get(this, 'hasDirtyAttributes')) {
      this.requestSave();
    }
  }),

  getNote() {
    return get(this, 'note');
  },

  getVel() {
    return get(this, 'velocity');
  },

  noteOn(note, velocity, timestamp) {
    set(this, 'note', note);
    set(this, 'velocity', velocity);

    if (get(this, 'noteOnPort.isConnected')) {
      let event = {
        targetTime: timestamp,
        callbackTime: performance.now()
      };
      get(this, 'noteOnPort').sendEvent(event);
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
      get(this, 'noteOffPort').sendEvent(event);
    }
  },

  build() {
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

    get(this, 'midi').noteListener = this;
  },

  ready() {
    if (!this.isNew) {
      get(this, 'midi').noteListener = this;
    }
  },

  didDelete() {
    get(this, 'midi').noteListener = null;
  }

});
