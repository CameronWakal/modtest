/*
  A service to queue timestamped callback events and call groups of events
  periodically. The goal is reasonably low-latency and reliable callback
  timing, without congesting the app with too many timers scheduled by
  multiple components.
*/

import Service from '@ember/service';

import { get } from '@ember/object';

// for slo-mo debugging
const frameSkip = 0;

// fire events that are scheduled up to X ms
// later than the current time
const lookahead = 16.666;

export default Service.extend({

  requests: [],
  frameCounter: 0, // for slo-mo debugging

  setup() {
    window.requestAnimationFrame(this._sendEvents.bind(this));
  },

  queueEvent(event, callback) {
    this.requests.pushObject({
      callback,
      event
    });
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
    let sortedRequests = this.requests.sortBy('event.targetTime');
    let event = get(sortedRequests, 'firstObject.event');
    let callback = get(sortedRequests, 'firstObject.callback');

    // remove and call events until there are no events left
    // with timestamps earlier than the current time
    while (event && event.targetTime <= performance.now() + lookahead) {

      this.requests = sortedRequests.slice(1);
      event.callbackTime = performance.now();
      callback(event);

      // console.log('called:', event.targetTime, 'queue:', this.requests.mapBy('event.targetTime'));

      // sort the queue each time, because the last event
      // callback might have added more items to the queue.
      sortedRequests = this.requests.sortBy('event.targetTime');
      event = get(sortedRequests, 'firstObject.event');
      callback = get(sortedRequests, 'firstObject.callback');

    }

  }

});
