import DS from 'ember-data';
import Port from '../port/model';

export default Port.extend({
  //eventOut ports can have multiple eventIn ports as destinations
  connections: DS.hasMany('port-event-in', {async: true}),

  //pass the event to connected ports
  sendEvent(event) {
    this.get('connections').forEach( port => {
      port.sendEvent(event);
    });
  },

});