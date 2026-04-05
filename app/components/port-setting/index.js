import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default class PortSettingComponent extends Component {
  get port() {
    return this.args.port;
  }

  get portIsValueIn() {
    return this.port?.type === 'port-value-in';
  }

  get portIsEventOut() {
    return this.port?.type === 'port-event-out';
  }

  get connectedBus() {
    if (this.port?.isEnabled) {
      return null;
    }
    return this.port?.connections?.[0]?.module;
  }

  get portSettingClasses() {
    const classes = ['port-setting'];
    if (this.port?.isConnected) classes.push('connected');
    if (this.port?.isEnabled) classes.push('enabled');
    if (this.port?.isValuePort) classes.push('value-port-setting');
    if (this.port?.isEventPort) classes.push('event-port-setting');
    return classes.join(' ');
  }

  get title() {
    let title = '';
    if (this.port?.type === 'port-value-in') {
      if (this.port.minValue != null) {
        title += `min:${this.port.minValue} `;
      }
      if (this.port.maxValue != null) {
        title += `max:${this.port.maxValue} `;
      }
      if (this.port.canBeEmpty) {
        title += 'canBeEmpty';
      } else {
        title += 'cantBeEmpty';
      }
    }
    return title.trim();
  }

  get labelWithType() {
    let type = this.port?.type;
    let label = this.port?.label;
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
  }

  @action
  updateDisabledValue(value) {
    let port = this.port;
    port.disabledValue = value;

    // Call the disabledValueChangedMethod on the module if specified
    let methodName = port.disabledValueChangedMethod;
    if (!isEmpty(methodName)) {
      let module = port.module;
      let methodToCall = module[methodName];
      if (methodToCall) {
        methodToCall.call(module);
      }
    }

    port.save();
  }

  @action
  disconnectFromBus() {
    if (this.connectedBus) {
      this.port.disconnect();
    }
  }

  @action
  connectToBus(bus) {
    let sourcePort, destPort;
    if (this.portIsEventOut) {
      sourcePort = this.port;
      destPort = bus.eventInPort;
    } else {
      sourcePort = bus.eventOutPort;
      destPort = this.port;
    }

    this.disconnectFromBus();
    this.args.addBusConnection?.(sourcePort, destPort);
  }

  @action
  toggleEnabled() {
    // Clear connections when toggling enabled state
    // (connections must be cleared when enabling in case the port is connected to a bus)
    if (!isEmpty(this.port?.connections)) {
      this.port.disconnect();
    }

    this.port.isEnabled = !this.port.isEnabled;
    this.port.save();

    // Notify parent that port state changed (triggers diagram redraw)
    this.args.portDisconnected?.();
  }
}
