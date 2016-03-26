import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Clock',

  //external properties, use Ember getters and setters
  isStarted: false,
  trigOutPort: DS.belongsTo('port-event-out', {async: false} ),
  tempoInPort: DS.belongsTo('port-value-in', {async: false} ),
  resInPort: DS.belongsTo('port-value-in', {async: false} ),

  //internal properties, don't use Ember getters and setters
  defaultRes: 8, // ticks per beat
  defaultTempo: 120, // beats per minute
  startTime: null,
  tickCount: null,
  tickDuration: null,
  latency: 10, //milliseconds to add to the eventual midi event's timestamp to achieve stable timing

  didCreate() {
    //create ports
    this.addValueInPort('tempo', 'tempoInPort');
    this.addValueInPort('res', 'resInPort');
    this.addEventOutPort('trig', 'trigOutPort');
  },

  start() {
    this.set('isStarted', true);
    this.startTime = window.performance.now();
    this.tickCount = 0;
    this.sendTrigger();
  },

  stop() {
    this.set('isStarted', false);
  },

  sendTrigger() {
    if(!this.isStarted) { return; }

    let tempo = this.get('tempoInPort').getValue();
    if(tempo == null) { tempo = this.defaultTempo; }

    let res = this.get('resInPort').getValue();
    if(res == null) { res = this.defaultRes; }

    let newTickDuration = 60000 / (tempo*res); // milliseconds per tick

    if( this.tickDuration !== newTickDuration ) { // changing from existing tempo or resolution
      this.startTime += this.tickCount * this.tickDuration;
      this.tickCount = 0;
      this.tickDuration = newTickDuration;
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
    let port = this.get('trigOutPort');
    port.sendEvent({'targetTime':targetTime, 'outputTime':outputTime, 'callbackTime':currentTime});

  },

});
