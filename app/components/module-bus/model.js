/*
    Invisible module instantiated on patch model init for the purposes of routing
    port connections that don't appear in the patch diagram.
    e.g. a patch transport control that sends a reset signal to all modules,
    without needing to visually patch them on the diagram.
*/

import { belongsTo } from '@ember-data/model';
import Module from '../module/model';

export default class ModuleBusModel extends Module {
  type = 'module-bus'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6

  @belongsTo('port-event-out', { async: false, inverse: null }) eventOutPort;

  get eventInPort() {
    return this.eventInPorts?.[0];
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    // In Ember Data 4.x, check if truly new by verifying ports are empty
    // Records loaded from storage will have embedded ports populated
    if (this.isNew && this.ports.length === 0) {
      // create ports
      this.addEventInPort('eventIn', 'eventIn', false);
      this.addEventOutPort('eventOut', 'eventOutPort', false);
    }
  }

  eventIn(event) {
    this.eventOutPort.sendEvent(event);
  }
}
