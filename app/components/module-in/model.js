import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

const {
  inject,
  get,
  set,
  computed,
  observer
} = Ember;

const {
  belongsTo,
  attr
} = DS;

export default Module.extend({

  type: 'module-in', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'In',

  midi: inject.service(),

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
    return 60;
  },

  getVel() {
    return 127;
  },

  ready() {
    get(this, 'midi').noteListener = this;

    if (get(this, 'isNew')) {
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

  didDelete() {
    get(this, 'midi').noteListener = null;
  },

});
