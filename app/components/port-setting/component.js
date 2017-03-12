import Ember from 'ember';

const {
  get,
  Component,
  computed,
  computed: { equal }
} = Ember;

export default Component.extend({

  classNames: ['port-setting'],
  classNameBindings: [
    'port.isConnected:connected',
    'port.isEnabled:enabled',
    'port.isValuePort:value-port-setting',
    'port.isEventPort:event-port-setting'
  ],
  attributeBindings: ['title'],
  title: computed('port.{minValue,maxValue,canBeEmpty,type}', function() {
    let title = '';
    if (get(this, 'port.type') == 'port-value-in') {
      if (get(this, 'port.minValue') != null) {
        title += `min:${get(this, 'port.minValue')} `;
      }
      if (get(this, 'port.maxValue') != null) {
        title += `max:${get(this, 'port.maxValue')} `;
      }
      if (get(this, 'port.canBeEmpty')) {
        title += 'canBeEmpty';
      } else {
        title += 'cantBeEmpty';
      }
    }
    return title.trim();
  }),

  portIsValueIn: equal('port.type', 'port-value-in'),
  labelWithType: computed('port.{label,type}', function() {
    let type = get(this, 'port.type');
    let label = get(this, 'port.label');
    switch (type) {
      case 'port-value-in':
        return `>${label}`;
      case 'port-value-out':
        return `${label}>`;
      case 'port-event-in':
        return `->${label}`;
      case 'port-event-out':
        return `${label}->`;
    }
  })
});