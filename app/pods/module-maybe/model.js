import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Maybe', 

  eventInPort: DS.belongsTo('port-event-in', {async: false} ),
  eventOutPort: DS.belongsTo('port-event-out', {async: false} ),
  numeratorInPort: DS.belongsTo('port-value-in', {async: false} ),
  denominatorInPort: DS.belongsTo('port-value-in', {async: false} ),

  onEventIn(event) {
    const numerator = this.get('numeratorInPort').getValue();
    const denominator = this.get('denominatorInPort').getValue();
    if(numerator === null || denominator === null) {
      return;
    }

    const prob = numerator/denominator;
    const rand = Math.random();

    if(rand <= prob) {
      this.get('eventOutPort').sendEvent(event);
    } 

  },

  didCreate() {
    //create ports
    this.addEventInPort('in', 'onEventIn', true);
    this.addEventOutPort('out', 'eventOutPort', true);
    this.addValueInPort('numerator', 'numeratorInPort', true);
    this.addValueInPort('denominator', 'denominatorInPort', true);

    this.save();
  },

});
