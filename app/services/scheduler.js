/*
  A service to queue timestamped callback events and call groups of events
  periodically. The goal is reasonably low-latency and reliable callback
  timing, without congesting the app with too many timers scheduled by
  multiple components.
*/

import Service from '@ember/service';

// for slo-mo debugging
const frameSkip = 0;

// fire events that are scheduled up to X ms
// later than the current time
const lookahead = 16.666;

export default class SchedulerService extends Service {
  requests = null;
  frameCounter = 0; // for slo-mo debugging

  setup() {
    window.requestAnimationFrame(this._sendEvents.bind(this));
    this.requests = [];
  }

  queueEvent(event, callback, module) {
    this.requests.pushObject({
      callback,
      event,
      module
    });
  }

  cancelEventsForModule(module) {
    this.requests = this.requests.rejectBy('module', module);
  }

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
    let event = sortedRequests[0]?.event;
    let callback = sortedRequests[0]?.callback;

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
      event = sortedRequests[0]?.event;
      callback = sortedRequests[0]?.callback;

    }

  }
}
