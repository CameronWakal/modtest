import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';
import Module from '../module/model';
import DS from 'ember-data';

const {
  belongsTo
} = DS;

export default Module.extend({

  midi: service(),

  type: 'module-ccout', // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name: 'CC Out',

  controlInPort: belongsTo('port-value-in', { async: false }),
  channelInPort: belongsTo('port-value-in', { async: false }),
  valueInPort: belongsTo('port-value-in', { async: false }),

  sendEvent() {
    // check the connection of the 'note' port for the value of the note to play.
    let value = get(this, 'valueInPort').getValue();
    let control = get(this, 'controlInPort').getValue();
    if (value != null && control != null) {
      let channel = get(this, 'channelInPort').getValue();
      get(this, 'midi').sendCC(control, value, channel);
    }
  },

  build() {
    set(this, 'title', this.name);

    // create ports
    this.addEventInPort('trig', 'sendEvent', true);

    this.addValueInPort('control', 'controlInPort', { isEnabled: false, canBeEmpty: true, defaultValue: 0, minValue: 0, maxValue: 127 });
    this.addValueInPort('channel', 'channelInPort', { isEnabled: false, defaultValue: 0, minValue: 0, maxValue: 15 });
    this.addValueInPort('value', 'valueInPort', { canBeEmpty: true, minValue: 0, maxValue: 127 });

    console.log('module-ccout.didCreate() requestSave()');
    this.requestSave();
  }

});
