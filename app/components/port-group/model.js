import { filterBy } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, hasMany } = DS;

export default Model.extend({
  ports: hasMany('port', { polymorphic: true, async: false }),
  enabledPorts: filterBy('ports', 'isEnabled', true),

  save() {
    this._super({ adapterOptions: { dontPersist: true } });
  }

});
