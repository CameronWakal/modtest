import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import Module from '../module/model';
import { belongsTo, attr } from '@ember-data/model';

const noteDuration = 20;
const latency = 10;

export default class ModuleOutModel extends Module {
  @service midi;

  type = 'module-out'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Out';

  events = null;
  @tracked latestTriggerTime = null;
  @tracked triggerDuration = null;

  @belongsTo('port-value-in', { async: false, inverse: null }) noteInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) velInPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) channelInPort;
  @attr('string', { defaultValue: 'All' }) outputDeviceName;

  get deviceMenuOptions() {
    let devices = this.midi.outputDevices.map(d => d.name);
    let currentDevice = this.outputDeviceName;
    if (!devices.includes(currentDevice) && currentDevice !== 'All') {
      devices = [currentDevice, ...devices];
    }
    return ['All', ...devices];
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    this.events = [];
  }

  configure() {
    this.addEventInPort('trig', 'sendEvent', true);
    this.addValueInPort('note', 'noteInPort', { canBeEmpty: true, minValue: 0, maxValue: 127 });
    this.addValueInPort('vel', 'velInPort', { defaultValue: 127, minValue: 0, maxValue: 127, isEnabled: false });
    this.addValueInPort('channel', 'channelInPort', { defaultValue: 1, minValue: 1, maxValue: 16, isEnabled: false });
    this.addMenuSetting('Output', 'outputDeviceName', 'deviceMenuOptions', this);
  }

  sendEvent(event) {
    // We add some padding ms to the event timestamps to allow for latency.
    // Send an alert if the latency is more than the allowed padding.
    let netLatency = performance.now() - (event.targetTime + latency);
    if (netLatency > 0) {
      console.log(`Note event is late by ${netLatency}`);
    }

    // Diagnostic:
    // Calculate average callback delay and average time for event to traverse graph.

    event.completionTime = performance.now();
    this.events.push(event);
    if (this.events.length >= 64) {
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

      this.events = [];
    }

    // Check the connection of the 'note' port for the value of the note to play.
    let note = {
      value: this.noteInPort.getValue(),
      velocity: this.velInPort.getValue(),
      duration: noteDuration,
      timestamp: event.targetTime + latency,
      channel: this.channelInPort.getValue() - 1
    };
    if (note.value != null) {
      this.midi.sendNote(note, this.outputDeviceName);
      this.triggerDuration = event.duration;
      this.latestTriggerTime = event.targetTime;
    }
  }
}
