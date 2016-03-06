import DS from 'ember-data';
import Module from '../../models/module';

export default Module.extend({
  
  label: 'Clock',

  trigOutPort: DS.belongsTo('port-event-out', {async: false} ),

  didCreate() {
    //create ports
    this.addEventOutPort('trig', 'trigOutPort');

  },

});
