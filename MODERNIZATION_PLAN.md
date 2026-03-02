# Modtest Modernization Plan

> **Goal:** Update from Ember 3.22 to Ember 5.x with modern idioms and critical test coverage
> **Approach:** Small, incremental, low-risk steps with manual testing checkpoints
> **Created:** 2026-02-17

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Phase Overview](#phase-overview)
3. [Detailed Implementation Plan](#detailed-implementation-plan)
4. [Risk Mitigation](#risk-mitigation)
5. [Testing Checkpoints](#testing-checkpoints)

---

## Current State Analysis

### Versions
| Package | Current | Target |
|---------|---------|--------|
| ember-source | 3.22.0 | 5.x |
| ember-data | 3.22.0 | 5.x |
| ember-cli | 3.22.0 | 5.x |
| Node.js | 10/12+ | 18+ |

### Technical Debt Inventory
- **51 components** using classic `Component.extend()` pattern
- **~50+ observers** throughout codebase (anti-pattern)
- **jQuery integration** still enabled
- **Classic routes/controllers** using `.extend()` syntax
- **Manual DOM event listeners** (memory leak risk)
- **No automated tests**
- **Console.log statements** scattered throughout (~40+)

### Key Dependencies to Update
- `ember-localforage-adapter` (beta version) - critical for data persistence
- `ember-wormhole` → `ember-composable-helpers` or native portals
- `emberx-range-input` - may need replacement
- `rangeslider.js` - manual import, assess alternatives

---

## Phase Overview

| Phase | Description | Risk Level | Testing Checkpoint |
|-------|-------------|------------|-------------------|
| **0** | Preparation & baseline | None | Verify app works |
| **1** | Ember 3.22 → 3.28 LTS | Low | Full app test |
| **2** | Remove jQuery dependency | Low-Medium | Full app test |
| **3** | Convert routes to native classes | Low | Navigation test |
| **4** | Convert controllers to native classes | Low | State management test |
| **5** | Ember 3.28 → 4.12 LTS | Medium | Full app test |
| **6** | Convert components to Glimmer (batch 1) | Medium | Component tests |
| **7** | Convert components to Glimmer (batch 2) | Medium | Component tests |
| **8** | Replace observers with @tracked | Medium-High | Full app test |
| **9** | Ember 4.12 → 5.x | Medium | Full app test |
| **10** | Add critical path tests | Low | Test suite passes |
| **11** | Cleanup & documentation | Low | Final review |

---

## Detailed Implementation Plan

### Phase 0: Preparation & Baseline
**Estimated Risk: None**

#### Step 0.1: Document current functionality
- [ ] Record current app behavior with screenshots/notes
- [ ] Document all module types and their expected behavior
- [ ] List all MIDI interactions to verify later
- [ ] Create manual test checklist

#### Step 0.2: Ensure clean starting point
- [ ] Verify `npm install` works
- [ ] Verify `npm run build` succeeds
- [ ] Verify app runs in browser without console errors
- [ ] Commit any uncommitted changes

#### Step 0.3: Update Node.js requirements
- [ ] Update `engines` in package.json to Node 18+
- [ ] Verify build still works with modern Node

**🧪 TESTING CHECKPOINT:** App loads, modules can be created, connections work, MIDI accessible

---

### Phase 1: Ember 3.22 → 3.28 LTS
**Estimated Risk: Low**

#### Step 1.1: Update ember-source
- [ ] Run `npx ember-cli-update` or manually update versions
- [ ] Update ember-source to ~3.28.0
- [ ] Update ember-cli to ~3.28.0
- [ ] Update ember-data to ~3.28.0

#### Step 1.2: Fix any deprecation warnings
- [ ] Run app and check console for deprecations
- [ ] Address each deprecation warning
- [ ] Run `npm run lint` and fix any new linting errors

#### Step 1.3: Update related dependencies
- [ ] Update @ember/optional-features
- [ ] Update ember-cli-babel
- [ ] Update ember-resolver

**🧪 TESTING CHECKPOINT:** Full manual test - create patch, add modules, connect ports, save/reload

---

### Phase 2: Remove jQuery Dependency
**Estimated Risk: Low-Medium**

#### Step 2.1: Audit jQuery usage
- [ ] Search codebase for jQuery patterns ($, jQuery, this.$)
- [ ] Document all jQuery usages

#### Step 2.2: Replace jQuery with native DOM
- [ ] Convert any jQuery DOM queries to native
- [ ] Update event handling if using jQuery events

#### Step 2.3: Disable jQuery integration
- [ ] Set `jquery-integration: false` in optional-features.json
- [ ] Remove jQuery from dependencies if present
- [ ] Test all components for regressions

**🧪 TESTING CHECKPOINT:** All drag/drop, click handlers, module interactions work

---

### Phase 3: Convert Routes to Native Classes
**Estimated Risk: Low**

#### Step 3.1: Convert application route
- [ ] Convert `Route.extend()` to `class extends Route`
- [ ] Update imports for decorators (@service, @action)
- [ ] Replace `this._super()` with `super`
- [ ] Test route transitions

#### Step 3.2: Convert patch route
- [ ] Convert to native class syntax
- [ ] Update lifecycle hooks
- [ ] Test patch loading/navigation

**🧪 TESTING CHECKPOINT:** Navigation between patches works, new patch creation works

---

### Phase 4: Convert Controllers to Native Classes
**Estimated Risk: Low**

#### Step 4.1: Convert application controller
- [ ] Convert to native class syntax
- [ ] Update computed properties to getters with @tracked
- [ ] Update actions to @action decorator

#### Step 4.2: Convert patch controller
- [ ] Convert to native class syntax
- [ ] Test delete functionality

**🧪 TESTING CHECKPOINT:** Patch selection dropdown works, delete patch works

---

### Phase 5: Ember 3.28 → 4.12 LTS
**Estimated Risk: Medium**

#### Step 5.1: Pre-upgrade preparation
- [ ] Review Ember 4.0 upgrade guide
- [ ] Update ember-cli-update if available
- [ ] Check addon compatibility (ember-localforage-adapter, ember-wormhole)

#### Step 5.2: Core framework upgrade
- [ ] Update ember-source to ~4.12.0
- [ ] Update ember-cli to ~4.12.0
- [ ] Update ember-data to ~4.12.0

#### Step 5.3: Fix breaking changes
- [ ] Address any removed APIs
- [ ] Update deprecated patterns
- [ ] Fix template syntax changes if any

#### Step 5.4: Update/replace incompatible addons
- [ ] Check ember-localforage-adapter compatibility (may need alternative)
- [ ] Check ember-wormhole (consider `in-element` helper instead)
- [ ] Update or replace emberx-range-input

**🧪 TESTING CHECKPOINT:** Full app functionality test, persistence works, all modules work

---

### Phase 6: Convert Components to Glimmer (Batch 1 - Core)
**Estimated Risk: Medium**

Convert the most critical components first:

#### Step 6.1: Module base component
- [ ] Convert `app/components/module/component.js` to Glimmer
- [ ] Replace `@ember/component` with `@glimmer/component`
- [ ] Update lifecycle (init → constructor, didInsertElement → modifier)
- [ ] Convert classNameBindings to template logic
- [ ] Replace observers with @tracked

#### Step 6.2: Port components
- [ ] Convert port-group component
- [ ] Convert port base component
- [ ] Convert port-value-in, port-value-out
- [ ] Convert port-event-in, port-event-out

#### Step 6.3: Patch diagram component
- [ ] Convert patch-diagram component
- [ ] Update template syntax

**🧪 TESTING CHECKPOINT:** Modules display correctly, ports connect, dragging works

---

### Phase 7: Convert Components to Glimmer (Batch 2 - Modules)
**Estimated Risk: Medium**

Convert remaining module type components:

#### Step 7.1: Timing modules
- [ ] module-clock
- [ ] module-clock-div
- [ ] module-repeat

#### Step 7.2: Sequencing modules
- [ ] module-sequence
- [ ] module-sequence-euclidean

#### Step 7.3: I/O modules
- [ ] module-out
- [ ] module-in
- [ ] module-cc-out
- [ ] module-bus

#### Step 7.4: Value/Control modules
- [ ] module-value
- [ ] module-button
- [ ] module-switch
- [ ] module-maybe

#### Step 7.5: Remaining modules
- [ ] All remaining module types
- [ ] Settings components
- [ ] Helper components (array-editor, etc.)

**🧪 TESTING CHECKPOINT:** Each module type functions correctly after conversion

---

### Phase 8: Replace Observers with @tracked
**Estimated Risk: Medium-High**

This is the most complex phase - observers are deeply integrated.

#### Step 8.1: Model observers
- [ ] Audit all observers in models (patch.js, array.js, array-item.js)
- [ ] Convert Array model observers to tracked properties
- [ ] Convert ArrayItem observers
- [ ] Update any computed properties depending on these

#### Step 8.2: Port observers
- [ ] Convert port model observers
- [ ] Update connection change handling
- [ ] Ensure reactivity still works

#### Step 8.3: Module observers
- [ ] Convert observers in base module model
- [ ] Convert observers in each module type
- [ ] Test each module's reactive behavior

#### Step 8.4: Component observers
- [ ] Convert remaining component observers
- [ ] Replace with tracked state or effects

**🧪 TESTING CHECKPOINT:** Reactive updates work - value changes propagate, UI updates correctly

---

### Phase 9: Ember 4.12 → 5.x
**Estimated Risk: Medium**

#### Step 9.1: Pre-upgrade audit
- [ ] Review Ember 5.0 upgrade guide
- [ ] Check all addon compatibility
- [ ] Run deprecation workflow

#### Step 9.2: Core upgrade
- [ ] Update ember-source to ~5.x
- [ ] Update ember-cli to ~5.x
- [ ] Update ember-data to ~5.x (note: may be @ember-data/*)

#### Step 9.3: Address breaking changes
- [ ] Ember Data changes (if any)
- [ ] Template syntax updates
- [ ] Removed deprecated APIs

#### Step 9.4: Final addon updates
- [ ] Update all remaining addons to Ember 5 compatible versions
- [ ] Replace any incompatible addons

**🧪 TESTING CHECKPOINT:** Complete functionality test in Ember 5

---

### Phase 10: Add Critical Path Tests
**Estimated Risk: Low**

#### Step 10.1: Setup testing infrastructure
- [ ] Verify QUnit setup works
- [ ] Configure test helpers
- [ ] Set up test fixtures/factories

#### Step 10.2: Unit tests for core services
- [ ] Test scheduler service (event queuing, timing)
- [ ] Test MIDI service (port enumeration, message sending)

#### Step 10.3: Unit tests for core models
- [ ] Test Patch model (creation, module management)
- [ ] Test Array model (item management, value operations)
- [ ] Test Module base functionality

#### Step 10.4: Integration tests for key components
- [ ] Test module rendering and interaction
- [ ] Test port connection flow
- [ ] Test module deletion

#### Step 10.5: Acceptance tests for critical workflows
- [ ] Test: Create new patch, add modules, connect them
- [ ] Test: Save and reload patch
- [ ] Test: Delete patch

**🧪 TESTING CHECKPOINT:** Test suite passes, critical paths covered

---

### Phase 11: Cleanup & Documentation
**Estimated Risk: Low**

#### Step 11.1: Code cleanup
- [ ] Remove all console.log statements (or convert to proper logging)
- [ ] Run linter and fix all warnings
- [ ] Remove any dead code
- [ ] Update code comments

#### Step 11.2: Dependency cleanup
- [ ] Remove unused dependencies
- [ ] Audit package.json for outdated packages
- [ ] Run npm audit and address vulnerabilities

#### Step 11.3: Documentation
- [ ] Update README with current setup instructions
- [ ] Document architecture decisions
- [ ] Document module types and their behavior
- [ ] Add contribution guidelines

**🧪 FINAL CHECKPOINT:** Clean build, all tests pass, documentation complete

---

## Risk Mitigation

### Version Control Strategy
- Create a new branch for each phase
- Commit frequently within phases
- Tag completion of each phase
- Keep master/main stable for rollback

### Rollback Plan
- If a phase causes critical issues, revert to previous phase tag
- Document any manual data migrations needed
- Keep backup of localStorage data before testing

### Dependency Risks

| Dependency | Risk | Mitigation |
|------------|------|------------|
| ember-localforage-adapter | May not support Ember 5 | Research alternatives (ember-local-storage, custom adapter) |
| ember-wormhole | Deprecated | Use `{{in-element}}` helper (built into Ember) |
| emberx-range-input | May not support Ember 5 | Replace with native input[type=range] or ember-slider |
| rangeslider.js | Not Ember-aware | Keep as-is or find modern alternative |

---

## Testing Checkpoints

### Manual Testing Checklist
Use this checklist at each testing checkpoint:

#### Basic Functionality
- [ ] App loads without console errors
- [ ] Patch list displays in dropdown
- [ ] Can create new patch
- [ ] Can select different patch
- [ ] Can delete patch

#### Module Functionality
- [ ] Can drag module from palette to canvas
- [ ] Module displays at correct position
- [ ] Can move module by dragging
- [ ] Can delete module (select + backspace)
- [ ] Module label displays correctly

#### Port Connections
- [ ] Can click output port to start connection
- [ ] Connection line follows cursor
- [ ] Can connect to compatible input port
- [ ] Incompatible connections prevented
- [ ] Can disconnect by clicking connected port

#### Module Types (spot check)
- [ ] Clock module: generates events at set BPM
- [ ] Sequence module: steps through values
- [ ] Out module: sends MIDI notes (if MIDI device connected)
- [ ] Value module: outputs constant value

#### Persistence
- [ ] Changes save automatically
- [ ] Refresh browser - data persists
- [ ] Close/reopen browser - data persists

#### MIDI (if hardware available)
- [ ] MIDI devices appear in dropdown
- [ ] Can select output device
- [ ] Notes play on connected device
- [ ] MIDI clock sync works (if supported)

---

## Progress Tracking

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| 0 | Complete | 2026-02-17 | 2026-02-17 | Docs created, build verified, Node req updated |
| 1 | Complete | 2026-02-17 | 2026-02-17 | ember-source/cli 3.28, ember-data stays 3.22 (see notes) |
| 2 | Complete | 2026-02-17 | 2026-02-17 | jQuery integration disabled, using global jQuery for rangeslider.js |
| 3 | Complete | 2026-02-18 | 2026-02-18 | Routes converted to native classes |
| 4 | Complete | 2026-02-18 | 2026-02-18 | Controllers converted to native classes |
| 5 | Complete | 2026-02-18 | 2026-02-20 | Ember 4.12 upgrade successful (second attempt) |
| 6 | Not Started | | | |
| 7 | Not Started | | | |
| 8 | Not Started | | | |
| 9 | Not Started | | | |
| 10 | Not Started | | | |
| 11 | Not Started | | | |

---

## Notes & Decisions

### Phase 1 Notes (2026-02-17)

**Ember Data 3.28 Breaking Change:**
- Ember Data 3.28 has breaking changes for polymorphic embedded records
- The app uses polymorphic hasMany relationships for ports (port-value-in, port-event-out, etc.) embedded in port-groups
- Ember Data 3.28's stricter relationship handling caused ports to not persist after refresh
- **Decision:** Keep ember-data at 3.22 while upgrading ember-source and ember-cli to 3.28
- This will need to be addressed when upgrading to Ember 4.x/5.x

**Code Fixes Applied:**
- Updated `htmlSafe` imports from `@ember/string` to `@ember/template` (4 files)
- Added `inverse: null` to belongsTo relationships for port-groups in module-array, module-scale, module-switch
- Added explicit `inverse` specifications to port-group and module models
- Fixed camelCase model name `'portGroup'` to kebab-case `'port-group'` in port model
- Updated serializers to include parent attrs (portGroups, settings) when extending
- Removed IE11 from browser targets

**Deprecation Warnings (to address later):**
- jQuery integration deprecated (Phase 2)
- `this.` property fallback in templates (Phase 6-7)
- SASS deprecations (slash division, color functions, @import)

### Phase 2 Notes (2026-02-17)

**jQuery Integration Disabled:**
- Set `jquery-integration: false` in optional-features.json
- Ember's `this.$()` method no longer available in components
- Removed jQuery deprecation warning from build

**rangeslider.js Dependency:**
- rangeslider.js is a jQuery plugin used for custom vertical sliders
- jQuery added as direct dependency and imported globally via ember-cli-build.js
- range-slider component updated to use `$(this.element)` instead of `this.$()`

**Known Issue (Pre-existing):**
- Slider interaction doesn't trigger value update until using numeric input mode
- Handle invisible until value is set (intentional CSS for "no value" state)
- This is a pre-existing bug, not caused by jQuery changes

### Phase 3 Notes (2026-02-18)

**Routes Converted to Native Classes:**
- `application` route: `Route.extend({})` → `class ApplicationRoute extends Route {}`
- `patch` route: `Route.extend({})` → `class PatchRoute extends Route {}`
- Used `@action` decorator instead of `actions: {}` hash
- Used `@service` decorator (via `inject as service`) instead of `service()` function
- Replaced `this._super(...arguments)` with `super(...arguments)` in constructor
- Replaced `get(obj, 'prop')` with direct property access where appropriate

### Phase 4 Notes (2026-02-18)

**Controllers Converted to Native Classes:**
- `application` controller: `Controller.extend({})` → `class ApplicationController extends Controller {}`
- `patch` controller: `Controller.extend({})` → `class PatchController extends Controller {}`
- Used `@alias` decorator for computed property aliases
- Used `@action` decorator instead of `actions: {}` hash
- Class properties initialized directly (e.g., `currentPatch = null`)

### Phase 5 Notes (2026-02-18)

**Ember 4.12 Upgrade Attempted and Rolled Back:**

The upgrade to Ember 4.12 was attempted but encountered significant breaking changes requiring extensive codebase modifications:

1. **Ember Global Removed** - `ember-localforage-adapter` uses the deprecated Ember global which was removed in Ember 4. Required a shim to work around.

2. **Runloop API Changes** - `run.once`, `run.next`, `run.scheduleOnce`, `run.bind` no longer exist on the `run` object. Must import individual functions (`once`, `next`, `scheduleOnce`, `bind`) from `@ember/runloop`.

3. **Store Service No Longer Auto-Injected** - Routes and components must explicitly inject the store service with `@service store`.

4. **Implicit `this` Removed in Templates** - All template property references must use explicit `this.` prefix (e.g., `{{this.patches}}` instead of `{{patches}}`). This affected potentially hundreds of templates, generating 46000+ deprecation warnings.

**Decision:** Rolled back to Ember 3.28 LTS. Before attempting Ember 4+ again:
- Run `ember-no-implicit-this-codemod` to fix all template `this.` references
- Address other deprecation warnings while on 3.28
- Consider alternatives to `ember-localforage-adapter` which is unmaintained

**Forward-Compatible Code Improvements Made (kept after rollback):**
- Updated runloop imports to use individual functions (`once`, `next`, `scheduleOnce`, `bind`)
- Added explicit `@service store` injection to application route and patch-component
- Updated `application.hbs` template to use `this.` prefix
- Replaced `ember-wormhole` usage with native `{{in-element}}` helper

---

### Phase 5 Notes - Second Attempt (2026-02-20)

**Ember 4.12 Upgrade Successful:**

The second attempt at Ember 4.12 upgrade succeeded after addressing the following issues:

1. **Nested Embedded Records** - EmbeddedRecordsMixin only handles one level of embedding. Ports (inside portGroups inside modules) weren't getting their attributes loaded. Fixed by deep cloning embedded data before normalization, then pushing records with full attributes and relationships to the store.

2. **Polymorphic Relationship Serialization** - Added custom `_generateSerializedHasMany` to include type for polymorphic embedded records. Added `normalize` override to handle polymorphic belongsTo with `key_type` field.

3. **Async Relationship Issues** - Changed `settings` relationship to `async: false` for proper serialization. Added proper `inverse` configurations.

4. **Record Initialization Loops** - `isNew` returns true for records loaded from storage in Ember Data 4.x. Fixed by checking `this.isNew && this.portGroups.length === 0` instead of just `this.isNew`.

5. **Pre-loading Polymorphic Types** - Added `findAll` calls for all module types in application route to ensure polymorphic records are in store before relationships resolve.

**Key Files Modified:**
- `app/components/module/serializer.js` - Custom normalize for nested embedded records
- `app/serializers/application.js` - Polymorphic type handling
- `app/routes/application.js` - Pre-load all module types
- `app/models/patch.js` - Use `_needsInit` flag pattern
- 20+ module model files - Updated `isNew` checks

---

### Technical Audit Assessment (2026-02-26)

Following the Ember 4.12 upgrade and subsequent bugfixes, a comprehensive technical audit was performed.

**Current State:**

| Metric | Count |
|--------|-------|
| Glimmer components | 22 |
| Classic components | 48 |
| JS files | 122 |
| Template files | 49 |
| Test files | 12 (unit only) |

**Architecture Strengths:**
- Pod structure keeps module code colocated (model, component, template, styles)
- Clean module inheritance with well-defined helpers (`addEventOutPort`, `addValueInPort`, `addPortGroup`)
- Embedded records pattern makes serialization logical
- New auto-serialization of port/port-group belongsTo relationships simplifies module authoring
- Service architecture is clean (MIDI service, Scheduler service)

**Key Improvements Made During Ember 4.12 Stabilization:**
- Auto-serialize/restore port and port-group belongsTo relationships in module serializer
- Refactored module-merge-voices to use port-group expansion mechanism
- Fixed port-group to properly restore module relationship and trigger saves
- Fixed array-item computed property dependencies (`@each` → `[]`, `==` → `===`)
- Replaced remaining `mapBy` deprecations with native `map`

**Dependency Risk Assessment:**

| Dependency | Risk Level | Notes |
|------------|------------|-------|
| `ember-localforage-adapter` | **High** | Unmaintained (last publish 2019), beta version, requires Ember global shim |
| `jquery` | Medium | Only used for rangeslider.js; native replacement already built |
| `rangeslider.js` | Low | Native replacement exists in codebase |
| `ember-cli-sass-lint` | Low | Deprecated, should use stylelint |
| `babel-eslint` | Low | Deprecated, should use @babel/eslint-parser |

**Recommended Priority Actions:**
1. Remove jQuery dependency (native rangeslider replacement exists)
2. Plan and execute `ember-localforage-adapter` replacement (highest risk)
3. Continue Octane migration incrementally when touching files
4. Consider Ember 5.x upgrade after stabilizing current changes

**Framework Migration Assessment:**

Recommendation is to **stay with Ember**. The application is a good fit:
- Complex data relationships (modules, ports, connections, patches)
- Local-first with persistence
- Ember Data handles relationship tracking efficiently
- Not a typical CRUD app where other frameworks might excel

Ember 5.x migration is straightforward when ready (mainly dropping already-deprecated APIs).

**Module Authoring DevEx:**

Current pattern is clean and intuitive:
```javascript
export default Module.extend({
  type: 'module-button',
  name: 'Button',
  eventOutPort: belongsTo('port-event-out', { async: false, inverse: null }),

  init() {
    this._super(...arguments);
    if (this.isNew && this.ports.length === 0) {
      set(this, 'title', this.name);
      this.addEventOutPort('out', 'eventOutPort', true);
      this.requestSave();
    }
  }
});
```

Potential enhancements:
- TypeScript support for autocomplete
- Module generator blueprint (`ember g module my-module`)
- Expanded MODULES.md documentation

---

**Next Step:** Phase 6 - Convert components to Glimmer (Batch 1 - Core)
