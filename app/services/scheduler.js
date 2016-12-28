/**
  A service to queue timestamped callback events and call groups of events
  periodically. The goal is reasonably low-latency and reliable callback
  timing, without congesting the app with too many timers scheduled by
  multiple components.
*/

import Ember from 'ember';

const {
  Service,
  get,
  set
} = Ember;

// for slo-mo debugging
const frameSkip = 0;

// fire events that are scheduled up to X ms
// later than the current time
const lookahead = 16.666;

export default Service.extend({

  events: [],
  frameCounter: 0, // for slo-mo debugging

  setup() {
    window.requestAnimationFrame(this._sendEvents.bind(this));
  },

  queueEvent(event) {
    this.events.pushObject(event);
  },

  _sendEvents() {

    window.requestAnimationFrame(this._sendEvents.bind(this));

    // for slo-mo debugging
    this.frameCounter++;
    if (this.frameCounter >= frameSkip) {
      this.frameCounter = 0;
    } else {
      return;
    }

    // start by finding the event with the earliest timestamp
    let sortedEvents = this.events.sortBy('time');
    let event = get(sortedEvents, 'firstObject');

    // remove and call events until there are no events left
    // with timestamps earlier than the current time
    while (event && event.time <= performance.now() + lookahead) {

      this.events = sortedEvents.slice(1);
      event.callback(event.time);

      // console.log('called:', event.time, 'queue:', this.events.mapBy('time'));

      // sort the queue each time, because the last event
      // callback might have added more items to the queue.
      sortedEvents = this.events.sortBy('time');
      event = get(sortedEvents, 'firstObject');

    }

  }

});
