import ModuleGenericComponent from './module-generic';

//todo: computed properties, getters and setters to be more emberlike

export default ModuleGenericComponent.extend({

  resolution: 8, // ticks per beat
  tempo: null, // beats per minute
  tickDuration: null, // milliseconds per tick
  startTime: null,
  tickCount: null,
  isStarted: false,
  latency: 10, //milliseconds to add to the eventual midi event's timestamp to achieve stable timing

  init() {
    this.setTempo(120);
    this._super.apply(this, arguments);
  },

  actions: {
    start() {
      this.set('startTime', window.performance.now());
      this.set('isStarted', true);
      this.set('tickCount', 0);
      this.sendTrigger();
    },

    stop() {
      this.set('isStarted', false);
    },
  },

  sendTrigger() {
    if(!this.isStarted) {
      return;
    }

    //schedule a callback to self for the next trigger interval.
    //send a trigger event to all listeners immediately for the current trigger.

    var targetTime = this.startTime + (this.tickCount*this.tickDuration);   //the time the note should be sent out,
                                                                            //not including latency.
    var currentTime = window.performance.now();

    var nextTickDelay = this.tickDuration - (currentTime-targetTime);
    window.setTimeout(this.sendTrigger.bind(this), nextTickDelay);
    this.tickCount++;

    var outputTime = targetTime + this.latency;     //we add some latency to the timestamp,
                                                    //so the callbacks have some wiggle room
                                                    //without affecting the note timing.

    //send event to output port
    let port = this.module.get('trigOutPort');
    port.sendEvent({'outputTime':outputTime});

  },

  setTempo(aTempo) {
    this.setTickDuration(aTempo, this.resolution);
  },

  setResolution(aResolution) {
    this.setTickDuration(this.tempo, aResolution);
  },

  setTickDuration(aTempo, aResolution) {
    //update the start time to the most recently scheduled tick,
    //and set a new tick duration for future ticks.
    //this has the effect of the new tempo/resolution kicking in starting at the next tick.
    //would be more accurate to cancel and reschedule the upcoming callback and timestamp,
    //based on the exact time that the tempo was changed.
    this.startTime += this.tickCount*this.tickDuration;
    this.tickCount = 0;
    this.resolution = aResolution;
    this.tempo = aTempo;
    this.tickDuration = 60000 / (this.tempo*this.resolution); // milliseconds per tick
  },

});
