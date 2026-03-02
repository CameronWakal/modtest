import Component from '@ember/component';
import { computed, get } from '@ember/object';

export default Component.extend({

  actions: {
    busChanged(bus) {
      if (!bus.id) {
        this.disconnectFromBus();
      } else {
        this.connectToBus(bus);
      }
    }
  },

  menuItems: computed('busses.[]', function() {
    const busses = this.busses;
    if (!busses || !busses.length) {
      return [{ title: 'off' }];
    }
    // Access content directly to avoid deprecated PromiseManyArray proxy methods
    const bussesArray = busses.content || busses;
    return [{ title: 'off' }, ...bussesArray];
  }),

  selectedMenuItem: computed('connectedBus', function() {
    let connectedBus = this.connectedBus;
    if (connectedBus) {
      return connectedBus;
    } else {
      return { title: 'off' };
    }
  })

});
