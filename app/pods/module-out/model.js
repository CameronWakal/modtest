import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

const {
  inject,
  get,
  set
} = Ember;

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-out', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  label: 'Out',

  midi: inject.service(),

  noteInPort: belongsTo('port-value-in', { async: false }),
  velInPort: belongsTo('port-value-in', { async: false }),

  events: [],

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
    // let notePort = this.get('ports').findBy('label', 'note');
    let noteValue = get(this, 'noteInPort').getValue();
    let velValue = get(this, 'velInPort').getValue();
    if (noteValue != null) {
      get(this, 'midi').sendNote(noteValue, velValue, 20, event.outputTime);
    }

  },

  ready() {
    if (get(this, 'isNew')) {
      // create ports
      this.addEventInPort('trig', 'sendEvent', true);

      this.addValueInPort('note', 'noteInPort', { canBeEmpty: true, minValue: 0, maxValue: 127 });
      this.addValueInPort('vel', 'velInPort', { defaultValue: 127, minValue: 0, maxValue: 127, isEnabled: false });

      console.log('module-out.didCreate() requestSave()');
      this.requestSave();
    }
  }

});
