# Codebase Audit Report

**Date**: April 2026
**Ember Version**: 6.12
**Ember Data Version**: 5.8.0 (WarpDrive)
**Branch**: ember-6-upgrade

---

## Executive Summary

This is an Octane edition Ember.js 6.12 application for building modular audio/MIDI patch systems. The codebase contains ~4,600 lines of component JavaScript across 35+ components, using native class syntax, @tracked properties, and Glimmer components throughout.

**Overall Code Quality**: 8/10

**Modernization Status**: Substantially Complete
- Upgraded Ember from 5.12 to 6.12
- Upgraded Ember Data from 4.12 to 5.8 (WarpDrive)
- Migrated ESLint to v9 flat config
- Migrated Sass from @import to @use syntax
- Replaced ember-localforage-adapter with custom Dexie.js adapter
- All dependencies up to date

---

## Quality Metrics Summary

| Metric | Value | Status |
|--------|-------|--------|
| Total Components | 35+ | Good separation of concerns |
| Component JS Lines | ~4,600 | Well-structured |
| Component Templates | 51 files (~970 lines) | Clean, modern syntax |
| Services | 6 | Well-organized |
| Native Classes | 100% | Excellent |
| Glimmer Components | 100% | Excellent |
| @tracked Usage | 17+ files | Good |
| Legacy Observers | 6 files | Intentionally kept |
| Console Statements | 30 | Needs cleanup |
| Try/Catch Blocks | 1 | Insufficient |
| Test Files | 6 | Minimal coverage |

---

## Completed Modernization

### Phase 1: Critical (Complete)
- [x] Replace ember-localforage-adapter with Dexie.js
- [x] Upgrade Ember Data to 5.8.0 (WarpDrive)
- [x] Upgrade Ember to 6.12
- [x] Enable ES modules (use-ember-modules)
- [x] Update linting stack (ESLint 9, eslint-plugin-ember 12, ember-template-lint 7)

### Phase 2: High Priority (Complete)
- [x] Migrate ESLint to v9 flat config (`eslint.config.mjs`)
- [x] Modernize binding patterns (convert .bind(this) to arrow functions)
- [x] Reduce module initialization duplication (template method pattern)
- [x] Migrate Sass to @use syntax
- [x] Add ARIA attributes to range-slider component

### Phase 3: Medium Priority (Complete)
- [x] Update ember-resolver to 13.2.0
- [x] Update ember-cli to 6.11.2
- [x] Update @ember/test-helpers to 5.4.1

---

## Remaining Issues

### P1: Console Statements (30 instances across 11 files)

| File | Count | Context |
|------|-------|---------|
| `app/services/midi.js` | 9 | MIDI device initialization |
| `app/components/module-analyst/model.js` | 8 | Key analysis debug output |
| `app/adapters/application.js` | 3 | Auto-save request logging |
| `app/services/auto-save.js` | 2 | Save operations |
| `app/components/module-out/model.js` | 2 | Latency debug |
| `app/services/scheduler.js` | 1 | Commented out |
| `app/components/value-input-string.js` | 1 | Debug |
| `app/components/select-menu.js` | 1 | Debug |
| `app/components/base-value-input/component.js` | 1 | Debug |
| `app/components/module-scale/model.js` | 1 | Error logging |
| `app/components/module-analyst-graphable/model.js` | 1 | Debug |

**Recommendation**: Implement a logging service or remove for production.

### P1: Minimal Error Handling

Only 1 try/catch block in the entire codebase (`app/services/auto-save.js:55`).

**Missing error handling in**:
- Route model hooks (findAll, findRecord operations)
- MIDI initialization
- Scheduler operations
- IndexedDB adapter operations

**Recommendation**: Add error boundaries and proper error handling strategy.

### P1: Alert Usage (Anti-Pattern)

`app/services/midi.js:16` uses `alert()` for browser MIDI support check.

**Recommendation**: Replace with notification service or graceful degradation.

### P2: Test Coverage < 10%

Only 6 test files with minimal coverage:
- `tests/unit/adapters/application-test.js`
- `tests/unit/controllers/application-test.js`
- `tests/unit/controllers/patch-test.js`
- `tests/unit/routes/patch-test.js`
- `tests/unit/services/midi-test.js`
- `tests/unit/utils/math-util-test.js`

**Missing**:
- Component tests (0 of 35+ components)
- Integration tests
- Acceptance tests
- Service tests (scheduler, database, auto-save)

### P2: Direct DOM Access (33 instances)

Components using `document.addEventListener/removeEventListener`:
- `app/components/range-slider.js`
- `app/components/port.js`
- `app/components/patch-diagram.js`
- `app/components/module-wrapper.js`

**Risk**: Memory leaks if cleanup not handled properly.

**Status**: All files have proper `willDestroy` cleanup implemented.

---

## Intentionally Kept Patterns

### Manual Observers (6 files)

Files using `addObserver` that cannot be replaced with `@tracked`:

| File | Observer | Side Effect |
|------|----------|-------------|
| `app/models/array.js` | `length` | Create/destroy array-item records |
| `app/components/module-clock/model.js` | `source` | Start/stop MIDI listeners, timers |
| `app/components/module-plonkmap/model.js` | `inputPortsCount` | Create/destroy input port records |
| `app/components/port-group/model.js` | `portSetsCount` | Create/destroy expansion port records |
| `app/components/module-analyst/model.js` | `keyToOutput` | Send event through output port |
| `app/components/module-value/model.js` | `value` | Send event and save record |

**Rationale**: These observers trigger imperative side effects (record creation, event sending, timer management) that would cause infinite loops or fire incorrectly if placed in `@tracked` getters.

### @ember/runloop Usage (6 files)

| File | Function | Purpose |
|------|----------|---------|
| `app/services/auto-save.js` | `debounce`, `cancel` | Coalesce rapid save calls |
| `app/components/patch-diagram.js` | `scheduleOnce('afterRender')` | Wait for DOM before drawing canvas |
| `app/components/base-value-input/component.js` | `schedule('afterRender')` | Avoid tracked state mutation during render |
| `app/components/indicator-blinking.js` | `schedule('afterRender')` | Avoid tracked state mutation during render |
| `app/components/patch-component.js` | `scheduleOnce('afterRender')` | Reset state after render completes |
| `app/components/module-sequence-euclidean/model.js` | `schedule('actions')` | Work around Ember Data init timing |

**Rationale**: `schedule('afterRender')` calls avoid Glimmer's "mutation during tracking" errors. Migration to `ember-concurrency` would add dependency without meaningful benefit.

### Disabled Lint Rules

**ESLint** (`eslint.config.mjs`):
- `no-console: off` - Pending logging strategy
- `ember/no-observers: off` - Intentional observer usage (see above)
- `ember/no-runloop: off` - Intentional runloop usage (see above)

**Template Lint** (`.template-lintrc.js`):
- `no-at-ember-render-modifiers` - False positive for custom `did-insert`/`did-update` modifiers
- `no-pointer-down-event-binding` - Intentional for drag-and-drop interactions

---

## Architecture

### Component Structure

The codebase uses a sophisticated component-model architecture:

```
app/components/
├── module/model.js           # Base class (215 lines)
├── module-{name}/model.js    # Domain logic subclasses
├── module-{name}.js          # Glimmer component (optional)
├── module-{name}.hbs         # Template
└── ...
```

**Pattern**: Components with complex domain logic use a separate `model.js` file extending the base `Module` class, keeping UI concerns separate from business logic.

### Service Architecture

| Service | Responsibility | Dependencies |
|---------|----------------|--------------|
| `store` | Ember Data store access | - |
| `database` | IndexedDB persistence (Dexie.js) | - |
| `auto-save` | Debounced patch persistence | store |
| `current-patch` | Active patch state | - |
| `midi` | WebMIDI API integration | - |
| `scheduler` | Event timing/scheduling | - |

### Persistence Layer

Document-based storage with WarpDrive/Ember Data 5.8:

- **DatabaseService**: Dexie.js wrapper for IndexedDB
- **ApplicationAdapter**: Custom Ember Data adapter for full-document persistence
- **PatchSerializer**: Complete document serialization with embedded records (537 lines)
- **AutoSaveService**: Debounced persistence with runloop integration

**Data Flow**:
1. Patches stored as complete JSON documents (not normalized)
2. Embedded records (modules, ports, settings) serialized within patches
3. On change, auto-save schedules debounced patch save
4. Relationships use `inverse: null` for explicit, predictable behavior

---

## Positive Findings

- **100% Native Classes**: No `Ember.Component.extend()` or classic patterns
- **100% Glimmer Components**: All UI components use `@glimmer/component`
- **Modern Template Syntax**: Angle brackets, `{{on}}` modifier, no deprecated `{{action}}`
- **No jQuery**: Zero jQuery dependency
- **Proper Modifier Usage**: Custom `did-insert`/`did-update` modifiers (not deprecated @ember/render-modifiers)
- **Well-Structured MIDI Integration**: Comprehensive WebMIDI support
- **Clean Feature Organization**: Module types clearly separated
- **Active Maintenance**: Regular commits, modern tooling
- **Document-Based Persistence**: Ready for export/import and cloud sync
- **Explicit Relationship Management**: Predictable behavior with `inverse: null`

---

## Dependencies Status

All dependencies are current as of April 2026:

| Package | Version | Status |
|---------|---------|--------|
| ember-source | 6.12.0 | Current |
| ember-data | 5.8.0 | Current |
| ember-cli | 6.11.2 | Current |
| ember-resolver | 13.2.0 | Current |
| @ember/test-helpers | 5.4.1 | Current |
| @glimmer/component | 2.0.0 | Current |
| eslint | 9.x | Current (flat config) |
| eslint-plugin-ember | 12.7.5 | Current |
| ember-template-lint | 7.0.0 | Current |
| @warp-drive/ember | 5.8.0 | Current |
| dexie | 4.4.1 | Current |

---

## Recommended Next Steps

### High Priority
1. **Implement logging service** - Replace 30 console statements with proper logging
2. **Add error handling** - Implement try/catch blocks in async operations
3. **Replace alert()** - Use notification component in midi.js

### Medium Priority
4. **Begin test coverage** - Start with critical paths (auto-save, serializer, adapter)
5. **Configure template-lint** - Allow custom modifiers to eliminate false positives
6. **Add observer cleanup** - Ensure models using `addObserver` properly clean up in `willDestroy`

### Nice to Have
7. **Documentation** - Add JSDoc comments to complex serializer/adapter methods
8. **Performance audit** - Profile build size (vendor.js: 440KB, app.js: 262KB)

---

## Files to Monitor

| File | Concern |
|------|---------|
| `app/adapters/application.js` | Core persistence adapter |
| `app/serializers/patch.js` | Document serialization (537 lines) |
| `app/services/auto-save.js` | Debounced save, runloop usage |
| `app/services/midi.js` | WebMIDI integration, alert() usage |
| `app/initializers/warp-drive.js` | WarpDrive setup, deprecation handling |
| `eslint.config.mjs` | Disabled rules configuration |
| `.template-lintrc.js` | Disabled modifier and pointer event rules |

---

## Build Stats (April 2026)

| Asset | Size | Gzipped |
|-------|------|---------|
| vendor.js | 440 KB | 131 KB |
| app.js | 262 KB | 37 KB |
| chunk (Ember Data) | 349 KB | 103 KB |
| app.css | 13 KB | 2.4 KB |
