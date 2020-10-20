/*
    Invisible module instantiated on patch model init for the purposes of routing
    port connections that don't appear in the patch diagram.
    e.g. a patch transport control that sends a reset signal to all modules,
    without needing to visually patch them on the diagram.
*/

import { alias } from '@ember/object/computed';
import DS from 'ember-data';
import Module from '../module/model';

const {
  belongsTo
} = DS;

export default Module.extend({

  type: 'module-bus', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  eventOutPort: belongsTo('port-event-out', { async: false }),
  eventInPort: alias('eventInPorts.firstObject'),

  eventIn(event) {
    this.eventOutPort.sendEvent(event);
  },

  init() {
    this._super(...arguments);
    if (this.isNew) {
      // create ports
      this.addEventInPort('eventIn', 'eventIn', false);
      this.addEventOutPort('eventOut', 'eventOutPort', false);
      console.log('module-bus didCreate saveLater');
      this.requestSave();
    }
  }

});
