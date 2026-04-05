import { belongsTo, attr } from '@ember-data/model';
import { addObserver } from '@ember/object/observers';
import Module from '../module/model';

export default class ModuleValueModel extends Module {
  type = 'module-value'; // modelName that can be referenced in templates, constructor.modelName fails in Ember > 2.6
  name = 'Value';

  @attr('number') value;
  @belongsTo('port-event-out', { async: false, inverse: null }) changeOutPort;
  @belongsTo('port-value-in', { async: false, inverse: null }) valueInPort;

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init(...arguments);
    addObserver(this, 'value', this._valueChanged);
  }

  configure() {
    this.addEventInPort('set', 'setValue', false);
    this.addValueInPort('value', 'valueInPort', { isEnabled: false });
    this.addValueOutPort('value', 'getValue', true);
    this.addEventOutPort('changed', 'changeOutPort', false);
  }

  _valueChanged() {
    if (this.hasDirtyAttributes) {
      this.changeOutPort.sendEvent({
        targetTime: performance.now(),
        callbackTime: performance.now()
      });
      this.save();
    }
  }

  getValue() {
    return this.value;
  }

  setValue() {
    this.value = this.valueInPort.getValue();
  }
}
