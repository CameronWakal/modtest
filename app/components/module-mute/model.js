import { set, get } from '@ember/object';
import DS from 'ember-data';
import Module from '../module/model';

const {
  attr,
  belongsTo
} = DS;

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
    if (!get(this, 'isMuted')) {
      get(this, 'eventOutPort').sendEvent(event);
    }
  },

  getValue() {
    if (!get(this, 'isMuted')) {
      return get(this, 'valueInPort').getValue();
    }
    return null;
  },

  ready() {
    if (get(this, 'isNew')) {
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
