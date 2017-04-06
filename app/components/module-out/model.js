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

const noteDuration = 20;

export default Module.extend({

  type: 'module-out', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Out',

  midi: inject.service(),

  outputDeviceName: attr('string', { defaultValue: 'All' }),
  deviceMenuOptions: computed('midi.outputDevices', 'outputDeviceName', function() {
    let devices = get(this, 'midi.outputDevices').mapBy('name');
    let currentDevice = get(this, 'outputDeviceName');
    if (!devices.includes(currentDevice) && currentDevice !== 'All') {
      devices = [currentDevice, ...devices];
    }
    return ['All', ...devices];
  }),

  noteInPort: belongsTo('port-value-in', { async: false }),
  velInPort: belongsTo('port-value-in', { async: false }),
  channelInPort: belongsTo('port-value-in', { async: false }),

  events: [],
  latestTriggerTime: null,
  triggerDuration: null,

  onOutputDeviceNameChanged: observer('outputDeviceName', function(){
    if (get(this, 'hasDirtyAttributes')) {
      this.requestSave();
    }
  }),

  sendEvent(event) {
    // the clock adds some padding ms to the event timestamps to allow for callback latency.
    // send an alert if the callback latency is more than the allowed padding.
    let netLatency = window.performance.now() - event.outputTime;
    if (netLatency > 0) {
      console.log(`Note event is late by ${netLatency}`);
    }

    // Diagnostic:
    // Calculate average callback delay and average time for event to traverse graph.

    event.completionTime = window.performance.now();
    get(this, 'events').push(event);
    if (get(this, 'events.length') >= 64) {

      let callbackDeltas = get(this, 'events').map((item) => {
        return item.callbackTime - item.targetTime;
      });
      let executionDeltas = get(this, 'events').map((item) => {
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
      value: get(this, 'noteInPort').getValue(),
      velocity: get(this, 'velInPort').getValue(),
      duration: noteDuration,
      timestamp: event.outputTime,
      channel: get(this, 'channelInPort').getValue() - 1
    };
    if (note.value != null) {
      get(this, 'midi').sendNote(note);
      set(this, 'triggerDuration', event.duration);
      set(this, 'latestTriggerTime', event.targetTime);
    }

  },

  ready() {
    if (get(this, 'isNew')) {
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
