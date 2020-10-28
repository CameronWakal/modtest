import { set, get } from '@ember/object';
import { belongsTo, attr } from '@ember-data/model';
import Module from '../module/model';

export default Module.extend({

  type: 'module-mute', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'Mute',

  isMuted: attr('boolean', { defaultValue: false }),
  eventOutPort: belongsTo('port-event-out', { async: false }),
  valueInPort: belongsTo('port-value-in', { async: false }),

  toggle() {
    this.toggleProperty('isMuted');
  },

  mute() {
    set(this, 'isMuted', true);
  },

  unmute() {
    set(this, 'isMuted', false);
  },

  eventIn(event) {
    if (!this.isMuted) {
      this.eventOutPort.sendEvent(event);
    }
  },

  getValue() {
    if (!this.isMuted) {
      return this.valueInPort.getValue();
    }
    return null;
  },

  init() {
    this._super(...arguments);
    if (this.isNew) {
      set(this, 'title', this.name);
      // create ports
      this.addEventInPort('toggle', 'toggle', false);
      this.addEventInPort('mute', 'mute', false);
      this.addEventInPort('unmute', 'unmute', false);
      this.addEventInPort('in', 'eventIn', true);
      this.addValueInPort('in', 'valueInPort', { canBeEmpty: true });
      this.addEventOutPort('out', 'eventOutPort', true);
      this.addValueOutPort('out', 'getValue', true);
      console.log('module-value didCreate saveLater');
      this.requestSave();
    }
  }

});
