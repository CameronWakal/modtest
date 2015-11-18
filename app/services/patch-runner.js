import Ember from 'ember';

export default Ember.Service.extend({

  midi: Ember.inject.service(),

  setup() {
    
  },
  sendEvent(event, targetPort) {
    
    let module = targetPort.get('module');
    let moduleType = module.get('type');

    switch(moduleType) {
      case 'module-out':
        this.moduleOutReceiveEvent(event, targetPort);
        break;
      default:
        console.log('Error: patch runner did not recognize module type '+moduleType);
    }
  },

  moduleOutReceiveEvent(event, targetPort) {
    //the clock adds some padding ms to the event timestamps to allow for callback latency.
    //send an alert if the callback latency is more than the allowed padding.
    let netLatency = window.performance.now()-event.outputTime;
    if(netLatency>0) {
        console.log('Note event is late by '+netLatency);
    }

    this.get('midi').sendNote(80,127,200,event.outputTime);
  }

});
