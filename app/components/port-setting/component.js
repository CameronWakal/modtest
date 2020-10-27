import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { equal } from '@ember/object/computed';

export default Component.extend({

  classNames: ['port-setting'],
  classNameBindings: [
    'port.isConnected:connected',
    'port.isEnabled:enabled',
    'port.isValuePort:value-port-setting',
    'port.isEventPort:event-port-setting'
  ],
  attributeBindings: ['title'],

  portIsValueIn: equal('port.type', 'port-value-in'),
  portIsEventOut: equal('port.type', 'port-event-out'),

  connectedBus: computed('port.{isEnabled,connections}', function() {
    if (get(this, 'port.isEnabled')) {
      console.log('computed connectedBus is null');
      return null;
    }
    return get(this, 'port.connections.firstObject.module');
  }),

  actions: {
    disconnectFromBus() {
      if (this.connectedBus) {
        console.log('disconnecting!');
        this.port.disconnect();
      }
    },

    connectToBus(bus) {
      let sourcePort, destPort;
      if (this.portIsEventOut) {
        sourcePort = this.port;
        destPort = get(bus, 'eventInPort');
      } else {
        sourcePort = get(bus, 'eventOutPort');
        destPort = this.port;
      }

      this.actions.disconnectFromBus();
      console.log('connecting!');
      this.addBusConnection(sourcePort, destPort);
    }
  },

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
    return '';
  })

});
