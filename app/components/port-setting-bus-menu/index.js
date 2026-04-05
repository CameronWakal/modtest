import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PortSettingBusMenuComponent extends Component {
  get menuItems() {
    const busses = this.args.busses;
    if (!busses || !busses.length) {
      return [{ title: 'off' }];
    }
    // Access content directly to avoid deprecated PromiseManyArray proxy methods
    const bussesArray = busses.content || busses;
    return [{ title: 'off' }, ...bussesArray];
  }

  get selectedMenuItem() {
    let connectedBus = this.args.connectedBus;
    if (connectedBus) {
      return connectedBus;
    } else {
      return { title: 'off' };
    }
  }

  @action
  busChanged(bus) {
    if (!bus.id) {
      this.args.disconnectFromBus?.();
    } else {
      this.args.connectToBus?.(bus);
    }
  }
}
