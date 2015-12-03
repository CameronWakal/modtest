import DS from 'ember-data';
import Module from './module';

export default Module.extend({
  
  didCreate() {
    //create ports
    this.addPort('event', 'source', 'trig');

    this.save();
  },

  destroyRecord(options) {
    this.destroyPorts();
    this.deleteRecord();
    return this.save(options);
  },

});
