import Component from '@ember/component';
import { computed, get, action } from '@ember/object';

export default Component.extend({
  classNames: ['module-setting'],
  attributeBindings: ['title'],
  title: computed('setting.{minValue,maxValue,canBeEmpty}', function() {
    let title = '';
    if (get(this, 'setting.minValue') != null) {
      title += `min:${get(this, 'setting.minValue')} `;
    }
    if (get(this, 'setting.maxValue') != null) {
      title += `max:${get(this, 'setting.maxValue')} `;
    }
    return title.trim();
  }),

  @action
  valueInputChanged(newValue) {
    set(this, 'setting.value', newValue);
  }

});
