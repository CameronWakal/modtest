import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

export default Module.extend({

  label: 'Out',

  midi: Ember.inject.service(),

  noteInPort: DS.belongsTo('port-value-in', {async:false}),
  note: Ember.computed.alias('noteInPort.value'),

  events: [],

  sendEvent(event) {
    //the clock adds some padding ms to the event timestamps to allow for callback latency.
    //send an alert if the callback latency is more than the allowed padding.
    let netLatency = window.performance.now()-event.outputTime;
    if(netLatency>0) {
        console.log('Note event is late by '+netLatency);
    }

    // Diagnostic:
    // Calculate average callback delay and average time for event to traverse graph.
    /*
    event.completionTime = window.performance.now();
    this.get('events').push(event);
    if(this.get('events.length') >= 64) {
      
      let callbackDeltas = this.get('events').map(item=>{
        return item.callbackTime - item.targetTime;
      });
      let executionDeltas = this.get('events').map(item=>{
        return item.completionTime - item.callbackTime;
      });

      let callbackTotal = callbackDeltas.reduce(function(prev, item){
        return prev + item;
      });
      let executionTotal = executionDeltas.reduce(function(prev, item){
        return prev + item;
      });

      let callbackAverage = callbackTotal / callbackDeltas.length;
      let executionAverage = executionTotal / executionDeltas.length;

      console.log(callbackAverage, executionAverage);

      this.set('events', []);

    }
    */

    //check the connection of the 'note' port for the value of the note to play.
    //let notePort = this.get('ports').findBy('label', 'note');
    let noteValue = this.get('note');
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