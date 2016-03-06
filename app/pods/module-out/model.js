import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

export default Module.extend({

  label: 'Out',

  midi: Ember.inject.service(),

  noteInPort: DS.belongsTo('port-value-in', {async:false}),

  sendEvent(event) {
    //the clock adds some padding ms to the event timestamps to allow for callback latency.
    //send an alert if the callback latency is more than the allowed padding.
    let netLatency = window.performance.now()-event.outputTime;
    if(netLatency>0) {
        console.log('Note event is late by '+netLatency);
    }

    //check the connection of the 'note' port for the value of the note to play.
    //let notePort = this.get('ports').findBy('label', 'note');
    let noteValue = this.get('noteInPort').getValue();
    if(noteValue != null) {
      this.get('midi').sendNote(noteValue,127,200,event.outputTime);
    }

  },

  didCreate() {
    //create ports
    this.addEventInPort('trig', 'sendEvent');
    this.addValueInPort('note', 'noteInPort');

  },

});