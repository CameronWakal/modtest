import Ember from 'ember';

const {
  Service,
  set
} = Ember;

export default Service.extend({

  midi: null,
  timingListener: null,
  outputDevices: null,

  setup() {
    // request MIDI access
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: false }).then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
    } else {
      alert('No MIDI support in your browser.');
    }
  },

  updateOutputDevices() {
    let outputs = this.midi.outputs.values();
    let outputsArray = [];
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
      outputsArray.push(output.value);
    }
    set(this, 'outputDevices', outputsArray);
  },

  sendNote(note) {

    if (this.midi) {
      let noteOnMessage = [0x90 + note.channel, note.value, note.velocity];    // note on, middle C, full velocity (0x7f == 127)

      this.outputs = this.midi.outputs.values();
      for (let output = this.outputs.next(); output && !output.done; output = this.outputs.next()) {
        output.value.send(noteOnMessage, note.timestamp); // omitting the timestamp means send immediately.
        // Inlined array creation- note off, middle C,
        // release velocity = 64, timestamp = now + 1000ms.
        output.value.send([0x80 + note.channel, note.value, 0x40], note.timestamp + note.duration);
      }

    } else {
      console.log('Could not send note, midiAccess not initialized.');
    }
  },

  sendCC(number, value, channel) {
    if (this.midi) {
      // first four binary digits are '11' for CC messages, last four are the message channel
      let code = (11 << 4) + channel;
      let message = [code, number, value];

      this.outputs = this.midi.outputs.values();
      for (let output = this.outputs.next(); output && !output.done; output = this.outputs.next()) {
        output.value.send(message);
      }
    } else {
      console.log('Could not send control change, midiAccess not initialized.');
    }
  },

  onMIDISuccess(midiAccess) {
    this.midi = midiAccess;
    let inputs = this.midi.inputs.values();
    // loop through all inputs
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      // listen for midi messages
      input.value.onmidimessage = this.onMIDIMessage.bind(this);
    }

    this.outputs = this.midi.outputs.values();

    // listen for connect/disconnect message
    this.midi.midiManager = this;
    this.midi.onstatechange = this.onStateChange.bind(this);
    this.showMIDIPorts();
    this.updateOutputDevices();

  },

  onMIDIMessage(event) {
    let { data } = event;
    /*
    let cmd = data[0] >> 4;
    let channel = data[0] & 0xf;
    let type = data[0] & 0xf0; // channel agnostic message type. Thanks, Phil Burk.
    let note = data[1];
    let velocity = data[2];
    */

    // with pressure and tilt off
    // note off: 128, cmd: 8
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11:
    // bend: 224, cmd: 14

    switch (data[0]) {
      case 248:
        // timing clock, 24 times per quarter note
        if (this.timingListener) {
          this.timingListener.onMidiTimingClock(event);
        }
      break;
      case 242:
        console.log('set song position', data[1], data[2]);
      break;
      case 250:
        console.log('start');
        if (this.timingListener) {
          this.timingListener.reset();
          this.timingListener.start();
        }
      break;
      case 251:
        console.log('continue');
        if (this.timingListener) {
          this.timingListener.start();
        }
      break;
      case 252:
        console.log('stop');
        if (this.timingListener) {
          this.timingListener.stop();
        }
      break;
      default:
        switch (data[0] & 0xf0) { // channel agnostic message type.
          case 144: // noteOn message
            console.log('note on');
            // this.listener.noteOn(note, velocity);
          break;
          case 128: // noteOff message
            console.log('note off');
            // this.listener.noteOff(note, velocity);
          break;
        }
    }
  },

  onStateChange(event) {
    let {
      port
    } = event;
    let {
      state,
      name,
      type
    } = port;
    console.log(state, ': ', name, ', port:', port, ' type:', type);

    this.showMIDIPorts();
    this.updateOutputDevices();
  },

  onMIDIFailure(e) {
    console.log(`No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim ${e}`);
  },

  // MIDI utility functions
  showMIDIPorts() {
    let {
      inputs,
      outputs
    } = this.midi;
    let string = '';

    if (inputs.size) {
      string += 'MIDI Inputs:\n';
    }
    inputs.forEach((port) => {
      if (port.name) {
        string += `Name: ${port.name}`;
      }
      if (port.connection) {
        string += `, Connection: ${port.connection}`;
      }
      if (port.state) {
        string += `, State: ${port.state}`;
      }
      if (port.manufacturer) {
        string += `, Manufacturer: ${port.manufacturer}`;
      }
      if (port.version) {
        string += `, Version: ${port.version}`;
      }
      string += '\n';
    });

    if (outputs.size) {
      string += 'MIDI Outputs:\n';
    }
    outputs.forEach((port) => {
      if (port.name) {
        string += `Name: ${port.name}`;
      }
      if (port.connection) {
        string += `, Connection: ${port.connection}`;
      }
      if (port.state) {
        string += `, State: ${port.state}`;
      }
      if (port.manufacturer) {
        string += `, Manufacturer: ${port.manufacturer}`;
      }
      if (port.version) {
        string += `, Version: ${port.version}`;
      }
      string += '\n';
    });

    if (string) {
      console.log(string);
    }

  }

});
