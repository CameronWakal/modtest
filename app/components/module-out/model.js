import { inject as service } from '@ember/service';
import { observer, computed, set, get } from '@ember/object';
import Module from '../module/model';
import { belongsTo, attr } from '@ember-data/model';

const noteDuration = 20;
const latency = 10;

export default Module.extend({

  midi: service(),

  type: 'module-out', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Out',

  events: null,
  latestTriggerTime: null,
  triggerDuration: null,

  noteInPort: belongsTo('port-value-in', { async: false }),
  velInPort: belongsTo('port-value-in', { async: false }),
  channelInPort: belongsTo('port-value-in', { async: false }),
  outputDeviceName: attr('string', { defaultValue: 'All' }),

  deviceMenuOptions: computed('midi.outputDevices', 'outputDeviceName', function() {
    let devices = get(this, 'midi.outputDevices').mapBy('name');
    let currentDevice = this.outputDeviceName;
    if (!devices.includes(currentDevice) && currentDevice !== 'All') {
      devices = [currentDevice, ...devices];
    }
    return ['All', ...devices];
  }),

  onOutputDeviceNameChanged: observer('outputDeviceName', function() {
    if (this.hasDirtyAttributes) {
      this.requestSave();
    }
  }),

  sendEvent(event) {
    // we add some padding ms to the event timestamps to allow for latency.
    // send an alert if the latency is more than the allowed padding.
    let netLatency = performance.now() - (event.targetTime + latency);
    if (netLatency > 0) {
      console.log(`Note event is late by ${netLatency}`);
    }

    // Diagnostic:
    // Calculate average callback delay and average time for event to traverse graph.

    event.completionTime = performance.now();
    this.events.push(event);
    if (get(this, 'events.length') >= 64) {

      let callbackDeltas = this.events.map((item) => {
        return item.callbackTime - item.targetTime;
      });
      let executionDeltas = this.events.map((item) => {
        return item.completionTime - item.callbackTime;
      });

      let callbackTotal = callbackDeltas.reduce(function(prev, item) {
        return prev + item;
      });
      let executionTotal = executionDeltas.reduce(function(prev, item) {
        return prev + item;
      });

      let callbackAverage = callbackTotal / callbackDeltas.length;
      let executionAverage = executionTotal / executionDeltas.length;

      console.log('avg callback vs target time', callbackAverage, '\navg completion time from callback', executionAverage);

      set(this, 'events', []);

    }

    // check the connection of the 'note' port for the value of the note to play.
    let note = {
      value: this.noteInPort.getValue(),
      velocity: this.velInPort.getValue(),
      duration: noteDuration,
      timestamp: event.targetTime + latency,
      channel: this.channelInPort.getValue() - 1
    };
    if (note.value != null) {
      this.midi.sendNote(note, this.outputDeviceName);
      set(this, 'triggerDuration', event.duration);
      set(this, 'latestTriggerTime', event.targetTime);
    }

  },

  init() {
    this._super(...arguments);
    this.events = [];

    if (this.isNew) {
      set(this, 'title', this.name);

      // create ports
      this.addEventInPort('trig', 'sendEvent', true);
      this.addValueInPort('note', 'noteInPort', { canBeEmpty: true, minValue: 0, maxValue: 127 });
      this.addValueInPort('vel', 'velInPort', { defaultValue: 127, minValue: 0, maxValue: 127, isEnabled: false });
      this.addValueInPort('channel', 'channelInPort', { defaultValue: 1, minValue: 1, maxValue: 16, isEnabled: false });

      // create settings
      this.addMenuSetting('Output', 'outputDeviceName', 'deviceMenuOptions', this);

      console.log('module-out.didCreate() requestSave()');
      this.requestSave();
    }
  }

});
