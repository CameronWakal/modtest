# Modtest Module Reference

This document describes all module types available in the Modtest music sequencing application.

---

## Core Concepts

### Port Types

**Event Ports** (trigger/gate signals):
- `event-in` - Receives trigger events
- `event-out` - Sends trigger events
- Carry timing metadata: targetTime, duration, callbackTime

**Value Ports** (numeric data):
- `value-in` - Receives numeric values (can sum multiple inputs)
- `value-out` - Sends numeric values
- May be empty/null
- May have min/max constraints

---

## Timing Modules

### Clock
Generates timing signals at configurable tempo and resolution.

| Port | Type | Description |
|------|------|-------------|
| tempo | value-in | BPM (default: 120, min: 1) |
| res | value-in | Ticks per beat (default: 4, max: 24) |
| trig | event-out | Timing pulses |
| reset | event-out | Reset signal |

**Settings:** Source (Internal/External MIDI)

### Clock-Div
Divides incoming clock pulses with optional phase shift.

| Port | Type | Description |
|------|------|-------------|
| clock | event-in | Incoming clock |
| reset | event-in | Reset counter |
| div | value-in | Division factor (default: 6) |
| shift | value-in | Phase shift (default: 0) |
| trig | event-out | Divided pulses |

### Repeat
Repeats events after a delay with count/time limits.

| Port | Type | Description |
|------|------|-------------|
| trig | event-in | Event to repeat |
| tempo | value-in | Tempo for beat timing (default: 100) |
| count | value-in | Max repeats (default: 0) |
| gate/gatedenom | value-in | Gate time as fraction |
| delay/delaydenom | value-in | Delay time as fraction |
| trig | event-out | Repeated events |

**Settings:** Mode (count/gate/both), Units (beats/ms)

---

## Sequencing Modules

### Sequence
Step sequencer that advances on triggers.

| Port | Type | Description |
|------|------|-------------|
| inc | event-in | Advance to next step |
| reset | event-in | Reset to first step |
| value | value-out | Current step value |
| trig | event-out | Trigger when step has value |

**Settings:** Length (1-64), Input Type, Min/Max, Step

### Sequence-Euclidean
Generates Euclidean rhythm patterns.

| Port | Type | Description |
|------|------|-------------|
| steps | value-in | Pattern length (0-128) |
| pulses | value-in | Number of pulses |
| inc | event-in | Advance step |
| reset | event-in | Reset sequence |
| update | event-in | Recalculate pattern |
| value | value-out | 1 for pulse, null for rest |
| trig | event-out | Trigger on pulse |

### Array
Multi-index value lookup table.

| Port | Type | Description |
|------|------|-------------|
| index[n] | value-in | Index to read (1-4 ports) |
| out[n] | value-out | Value at index (1-4 ports) |

**Settings:** Length, Min/Max, Read Ports (1-4)

---

## MIDI Modules

### Out
Sends MIDI note events to output device.

| Port | Type | Description |
|------|------|-------------|
| trig | event-in | Trigger note |
| note | value-in | MIDI note (0-127) |
| vel | value-in | Velocity (0-127, default: 127) |
| channel | value-in | MIDI channel (1-16) |

**Settings:** Output device selection

### In
Receives MIDI note events.

| Port | Type | Description |
|------|------|-------------|
| on | event-out | Note-on event |
| off | event-out | Note-off event |
| note | value-out | Current note number |
| vel | value-out | Current velocity |

**Settings:** Input device selection

### CC-Out
Sends MIDI Control Change messages.

| Port | Type | Description |
|------|------|-------------|
| trig | event-in | Send CC message |
| control | value-in | CC number (0-127) |
| channel | value-in | MIDI channel (0-15) |
| value | value-in | CC value (0-127) |

---

## Value/Control Modules

### Value
Holds and outputs a constant value.

| Port | Type | Description |
|------|------|-------------|
| value | value-in | Set value from external |
| set | event-in | Trigger to update |
| value | value-out | Current value |
| changed | event-out | Fires on value change |

### Button
Manual trigger button.

| Port | Type | Description |
|------|------|-------------|
| out | event-out | Trigger event |

### Switch
Routes one of N input sets to output.

| Port | Type | Description |
|------|------|-------------|
| switch | value-in | Selection index |
| input[n] | value-in | N value inputs |
| input[n] | event-in | N event inputs |
| out | value-out | Selected value |
| out | event-out | Selected event |

**Settings:** Input Sets (1-4)

### Mute
Conditionally passes signals.

| Port | Type | Description |
|------|------|-------------|
| in | event-in | Event to pass |
| in | value-in | Value to pass |
| toggle | event-in | Toggle mute |
| mute/unmute | event-in | Force state |
| out | event-out | Passed event |
| out | value-out | Passed value |

### Maybe
Probability gate.

| Port | Type | Description |
|------|------|-------------|
| in | event-in | Event to filter |
| numerator | value-in | Probability num (default: 1) |
| denominator | value-in | Probability denom (default: 2) |
| out | event-out | Passed event |

---

## Transformation Modules

### Scale
Converts scale degrees to MIDI notes.

| Port | Type | Description |
|------|------|-------------|
| octave | value-in | Octave offset (default: 3) |
| root | value-in | Root note semitone |
| mode | value-in | Scale mode (0-6) |
| degree[n] | value-in | Scale degree (1-4 voices) |
| update | event-in | Recalculate |
| note[n] | value-out | MIDI note (1-4 voices) |

**Modes:** 0=Ionian, 1=Dorian, 2=Phrygian, 3=Lydian, 4=Mixolydian, 5=Aeolian, 6=Locrian

### Merge-Voices
Combines multiple event/value pairs.

| Port | Type | Description |
|------|------|-------------|
| in[n] | event-in | N event inputs (1-8) |
| in[n] | value-in | N paired values (1-8) |
| out | event-out | Selected event |
| out | value-out | Paired value |

### Plonkmap
Maps MIDI notes to Intellijel Plonk presets.

| Port | Type | Description |
|------|------|-------------|
| in[n] | event-in | Preset triggers (1-16) |
| low | value-out | Lowest MIDI note |
| high | value-out | Highest MIDI note |
| out | event-out | Trigger |

---

## Analysis Modules

### Analyst
Key detection using CEG Key-Finding Method.

| Port | Type | Description |
|------|------|-------------|
| in | event-in | Add note to analysis |
| value | value-in | MIDI note to analyze |
| reset | event-in | Clear analysis |
| root | value-out | Root semitone |
| mode | value-out | Scale mode |
| update | event-out | Key changed |

### Graph
Visual 2D data display.

| Port | Type | Description |
|------|------|-------------|
| lx, ly | value-in | Line point coordinates |
| l | event-in | Write line point |
| tx, ty | value-in | Triangle vertex |
| t | event-in | Write triangle vertex |
| reset | event-in | Clear display |

---

## Utility Modules

### Bus
Hidden internal routing (not visible in UI).

| Port | Type | Description |
|------|------|-------------|
| eventIn | event-in | Internal input |
| eventOut | event-out | Routed output |
