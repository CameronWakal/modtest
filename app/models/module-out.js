import Ember from 'ember';
import Module from './module';

export default Module.extend({

  midi: Ember.inject.service(),

  notePort: Ember.computed('ports.@each.label', function(){
    return this.get('ports').findBy('label', 'note');
  }),

  noteValue: Ember.computed.alias('notePort.source.value'),

  sendEvent(event) {
    //the clock adds some padding ms to the event timestamps to allow for callback latency.
    //send an alert if the callback latency is more than the allowed padding.
    let netLatency = window.performance.now()-event.outputTime;
    if(netLatency>0) {
        console.log('Note event is late by '+netLatency);
    }

    //check the connection of the 'note' port for the value of the note to play.
    //let notePort = this.get('ports').findBy('label', 'note');
    let noteValue = this.get('noteValue');

    if(noteValue) {
      this.get('midi').sendNote(noteValue,127,200,event.outputTime);
    }

  },

  didCreate() {
    //create ports
    this.addPort('event', 'destination', 'trig', 'sendEvent');
    this.addPort('value', 'destination', 'note');

    this.save();
  },

});