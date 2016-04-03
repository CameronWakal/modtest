import Ember from 'ember';
import Module from '../module/model';
import DS from 'ember-data';

export default Module.extend({

  label: 'CC Out',

  midi: Ember.inject.service(),

  controlInPort: DS.belongsTo('port-value-in', {async:false}),
  valueInPort: DS.belongsTo('port-value-in', {async:false}),

  sendEvent() {
    //check the connection of the 'note' port for the value of the note to play.
    //let notePort = this.get('ports').findBy('label', 'note');
    let value = this.get('valueInPort').getValue();
    let control = this.get('controlInPort').getValue();
    if(value != null && control != null) {
      let channel = this.get('channelInPort').getValue();
      if( channel == null ) { channel = 0 };
      this.get('midi').sendCC(control,value,channel);
    }

  },

  didCreate() {
    //create ports
    this.addEventInPort('trig', 'sendEvent');
    this.addValueInPort('control', 'controlInPort');
    this.addValueInPort('channel', 'channelInPort');
    this.addValueInPort('value', 'valueInPort');
    this.save();
  },

});