import Ember from 'ember';

export default Ember.Service.extend({

  midi: Ember.inject.service(),

  setup() {
    
  },
  sendEvent(event, targetPort) {
    
    let module = targetPort.get('module');
    let moduleType = module.get('type');

    switch(moduleType) {
      case 'out':
        this.moduleOutReceiveEvent(event, module, targetPort);
        break;
      case 'sequence':
        this.moduleSequenceReceiveEvent(event, module, targetPort);
        break;
      default:
        console.log('Error: patch runner did not recognize module type '+moduleType);
    }
  },

  moduleClockReceiveEvent(event, mClock, targetPort) {

  },

  moduleSequenceReceiveEvent(event, module, targetPort) {

    let portLabel = targetPort.get('label');
    let sequence = module.get('sequence');
    let currentStep = sequence.get('currentStep');

    switch(portLabel) {
      case 'inc step':
        if(currentStep === null) {
          sequence.set('currentStep', 0);
        } else if ( currentStep >= sequence.get('length')-1 ) {
          sequence.set('currentStep', 0);
        } else {
          sequence.set('currentStep', currentStep+1);
        }
      break;
      default:
        console.log('Error: patch runner no action found for port labelled '+portLabel);
    }
    
  },

  moduleOutReceiveEvent(event, module, targetPort) {
    //the clock adds some padding ms to the event timestamps to allow for callback latency.
    //send an alert if the callback latency is more than the allowed padding.
    let netLatency = window.performance.now()-event.outputTime;
    if(netLatency>0) {
        console.log('Note event is late by '+netLatency);
    }

    //check the connection of the 'note' port for the value of the note to play.
    let notePort = module.get('ports').findBy('label', 'note');
    let noteValue = this.readPort(notePort);
    
    if(noteValue) {
      this.get('midi').sendNote(noteValue,127,200,event.outputTime);
    }

  },

  //currently only works for reading from module type sequence
  //also should check that the passed in port is of type signal/destination
  //and check for port/kernel mismatch
  readPort(port) {
    let sourcePort = port.get('source');
    var value;

    if(sourcePort) {
      let sourceModule = sourcePort.get('module');
      let sourceModuleKernel = sourceModule.get('moduleKernel');
      if(sourceModuleKernel) {
        value = sourceModuleKernel.get(sourcePort.get('label'));
      }
    }

    return value;
  }

});
