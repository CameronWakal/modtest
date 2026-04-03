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
    this.requests.push({
      callback,
      event,
      module
    });
  }

  cancelEventsForModule(module) {
    this.requests = this.requests.filter(req => req.module !== module);
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

    let now = performance.now() + lookahead;

    // Process events until none remain with timestamps before now
    while (this.requests.length > 0) {
      // Find event with earliest timestamp (linear scan, avoids sorting overhead)
      let earliestIndex = 0;
      let earliestTime = this.requests[0].event.targetTime;

      for (let i = 1; i < this.requests.length; i++) {
        if (this.requests[i].event.targetTime < earliestTime) {
          earliestTime = this.requests[i].event.targetTime;
          earliestIndex = i;
        }
      }

      // Stop if earliest event is still in the future
      if (earliestTime > now) break;

      // Remove the event from queue and call it
      let request = this.requests.splice(earliestIndex, 1)[0];
      request.event.callbackTime = performance.now();
      request.callback(request.event);

      // console.log('called:', request.event.targetTime, 'queue:', this.requests.map(r => r.event.targetTime));
    }

  }
}
