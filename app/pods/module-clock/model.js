import Ember from 'ember';
import DS from 'ember-data';
import Module from '../module/model';

export default Module.extend({
  
  label: 'Clock',

  midi: Ember.inject.service(),

  //external properties, use Ember getters and setters
  isStarted: false,
  tempoInPort: DS.belongsTo('port-value-in', {async: false} ),
  resInPort: DS.belongsTo('port-value-in', {async: false} ),
  resetOutPort: DS.belongsTo('port-event-out', {async: false} ),
  trigOutPort: DS.belongsTo('port-event-out', {async: false} ),

  //internal properties, don't use Ember getters and setters
  defaultRes: 24, // ticks per beat
  defaultTempo: 120, // beats per minute
  startTime: null,
  tickCount: null,
  tickDuration: null,
  latency: 10, //milliseconds to add to the eventual midi event's timestamp to achieve stable timing

  sourceSetting: DS.belongsTo('module-setting-menu', {async:false}),

  onSourceChanged: Ember.observer('sourceSetting.value', function(){
    Ember.run.once(this, 'updateSource');
  }),

  updateSource() {
    if(this.get('sourceSetting.value') === 'Internal') {
      console.log('clock: use internal source');
      this.get('midi').timingListener = null;
      if(this.isStarted) { // reset the internal clock
        this.start();
      }
    } else if(this.get('sourceSetting.value') === 'External') {
      console.log('clock: use external source');
      this.get('midi').timingListener = this;
    } else {
      console.log('error: tried to update source to', this.get('sourceSetting.value'));
    }
  },

  didCreate() {
    //create settings
    this.addMenuSetting('Source', 'sourceSetting', ['Internal', 'External'], 'Internal');

    //create ports
    this.addValueInPort('tempo', 'tempoInPort');
    this.addValueInPort('res', 'resInPort');
    this.addEventOutPort('reset', 'resetOutPort');
    this.addEventOutPort('trig', 'trigOutPort');
    this.save();
  },

  start() {
    if(this.get('isStarted')) {
      this.reset();
    }
    this.set('isStarted', true);
    if( this.get('sourceSetting.value') === 'Internal' ) {
      this.startTime = window.performance.now();
      this.tickCount = 0;
      this.sendTrigger();
    }
  },

  stop() {
    if(!this.get('isStarted')) {
      this.reset();
    }
    this.set('isStarted', false);
  },

  reset() {
    this.get('resetOutPort').sendEvent();
  },

  sendTrigger(receivedTime) {
    if(this.isStarted) { 
      let targetTime;
      let currentTime = window.performance.now();

      if( this.get('sourceSetting.value') === 'External' ) {
        //external event is not timestamped, send it through right away
        targetTime = receivedTime;
      } else if ( this.get('sourceSetting.value') === 'Internal' ) {   
        //internal events get accurate target times based on tempo, resolution, and start time     
        let tempo = this.get('tempoInPort').getValue();
        if(tempo == null) { tempo = this.defaultTempo; }

        let res = this.get('resInPort').getValue();
        if(res == null) { res = this.defaultRes; }

        let newTickDuration = 60000 / (tempo*res); // milliseconds per tick

        //if the tempo or resolution has changed, reset the startTime and tickCount
        if( this.tickDuration !== newTickDuration ) {
          this.startTime += this.tickCount * this.tickDuration;
          this.tickCount = 0;
          this.tickDuration = newTickDuration;
        }

        //schedule a callback to self for the next trigger interval.
        targetTime = this.startTime + (this.tickCount*this.tickDuration);
        let nextTickDelay = this.tickDuration - (currentTime-targetTime);
        window.setTimeout(this.sendTrigger.bind(this), nextTickDelay);

        this.tickCount++;
      } else {
        console.log('error sending trigger, unrecognized source setting of', this.get('sourceSetting.value'));
        return;
      }

      //add some latency to the midi output time to allow room for callback inaccuracy and event execution
      let outputTime = targetTime + this.latency;
      this.get('trigOutPort').sendEvent({
        'targetTime':targetTime, 
        'outputTime':outputTime, 
        'callbackTime':currentTime
      });
    }
  }

});
