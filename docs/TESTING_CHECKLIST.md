# Manual Testing Checklist

Use this checklist at each testing checkpoint during modernization.

---

## Quick Smoke Test (5 min)
Use for minor changes.

- [ ] App loads without console errors
- [ ] Existing patches appear in dropdown
- [ ] Can switch between patches
- [ ] Modules display correctly
- [ ] Can add a new module

---

## Standard Test (15 min)
Use after each phase completion.

### Application Startup
- [ ] App loads without JavaScript errors
- [ ] No deprecation warnings in console (or expected ones only)
- [ ] Patch dropdown populates
- [ ] Current patch loads automatically

### Patch Management
- [ ] Create new patch (+ button or menu)
- [ ] Select different patch from dropdown
- [ ] Delete a patch (select module, press delete key)
- [ ] Patch changes persist after browser refresh

### Module Operations
- [ ] Drag module from palette to canvas
- [ ] Module appears at drop location
- [ ] Module label displays correctly
- [ ] Can move module by dragging header
- [ ] Can select module (click)
- [ ] Can delete module (select + backspace)
- [ ] Module deletion persists after refresh

### Port Connections
- [ ] Click output port - starts connection mode
- [ ] Connection line follows cursor
- [ ] Click compatible input port - creates connection
- [ ] Connection line drawn between ports
- [ ] Incompatible connection attempt - rejected
- [ ] Click connected port - disconnects
- [ ] Connections persist after refresh

### Module Settings
- [ ] Settings panel displays when module selected
- [ ] Dropdown menus work (e.g., device selection)
- [ ] Number inputs work
- [ ] Slider inputs work
- [ ] Settings persist after refresh

---

## Full Test (30+ min)
Use for major version upgrades.

### All Standard Tests above, plus:

### Clock Module
- [ ] Create Clock module
- [ ] Connect to visual indicator (e.g., sequence, graph)
- [ ] Clock pulses visible at default tempo
- [ ] Change tempo via value input
- [ ] Change resolution via value input
- [ ] External mode: responds to MIDI clock (if available)

### Sequence Module
- [ ] Create Sequence module
- [ ] Connect Clock → Sequence inc port
- [ ] Sequence steps through values
- [ ] Current step highlighted
- [ ] Can edit step values
- [ ] Reset port returns to step 0
- [ ] Length setting changes number of steps

### MIDI Output (requires MIDI device)
- [ ] Module-Out shows available devices
- [ ] Can select MIDI output device
- [ ] Connect Clock → Sequence → Out
- [ ] Notes play on MIDI device
- [ ] Velocity affects note loudness
- [ ] Channel routing works

### MIDI Input (requires MIDI device)
- [ ] Module-In shows available devices
- [ ] Can select MIDI input device
- [ ] Playing notes triggers events
- [ ] Note value output updates
- [ ] Velocity output updates

### Scale Module
- [ ] Connect sequence to degree input
- [ ] Note output produces valid MIDI notes
- [ ] Changing mode changes scale
- [ ] Changing root transposes output
- [ ] Multiple voices work

### Value Module
- [ ] Displays editable value
- [ ] Value output connects to inputs
- [ ] Manual edit triggers change event
- [ ] Set event updates from input

### Utility Modules
- [ ] Mute: blocks/passes signal
- [ ] Maybe: probabilistically passes
- [ ] Switch: routes selected input
- [ ] Clock-Div: divides clock correctly
- [ ] Repeat: repeats events

### Browser Persistence
- [ ] Create complex patch with multiple modules
- [ ] Close browser completely
- [ ] Reopen browser, navigate to app
- [ ] Patch loads correctly
- [ ] All connections intact
- [ ] All settings preserved

---

## Performance Test
Use for optimization validation.

- [ ] 20+ modules: UI remains responsive
- [ ] Fast tempo (200+ BPM): timing stable
- [ ] Moving modules: smooth dragging
- [ ] Connection lines: update without lag
- [ ] Browser dev tools: no memory leaks over 5 min

---

## Notes

**Console errors to watch for:**
- Ember deprecation warnings
- Uncaught exceptions
- Failed network requests (should be none - local only)
- Timing-related errors from scheduler

**Known behaviors:**
- First module drag requires MIDI permission dialog (on first use)
- External clock requires MIDI device sending timing

**Recording issues:**
When testing fails, record:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (screenshot)
5. Module configuration
