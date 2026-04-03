# Codebase Audit Report

**Date**: April 2026
**Ember Version**: 5.12 LTS
**Ember Data Version**: 5.8.0 (WarpDrive)

---

## Executive Summary

This is an Octane edition Ember.js 5.12 application with ~89 source files using native class syntax, @tracked properties, and Glimmer components. The codebase has been actively modernized.

**Recent Progress**:
- Upgraded Ember Data from 4.12 to 5.8 (WarpDrive)
- Configured WarpDrive build system and reactivity
- Fixed all Ember Data 5.x deprecations (non-strict types, duplicate hasMany pushes)
- Replaced `ember-localforage-adapter` with custom Dexie.js-based adapter
- Implemented document-based storage (patches stored as complete JSON documents)

---

## Critical Issues (P0)

### 1. ~~Ember Data 4.12 → 5.x~~ RESOLVED
- ~~Current: 4.12.8~~
- **Resolution**: Upgraded to Ember Data 5.8.0 with WarpDrive
  - Added `@warp-drive/ember` for reactivity integration
  - Configured build via `@warp-drive/build-config`
  - Fixed deprecations: non-strict types (`arrayItem` → `array-item`)
  - Converted array/array-item to explicit relationship management (`inverse: null`)
  - Added deprecation handler for `store.findAll` (custom IndexedDB adapter pattern)

### 2. ~~ember-localforage-adapter~~ RESOLVED
- **Resolution**: Replaced with custom adapter using Dexie.js
  - Core files: `app/services/database.js`, `app/adapters/application.js`, `app/serializers/patch.js`, `app/services/auto-save.js`

### 3. Test Coverage < 10%
- Only 6 test files with 69 total lines
- 51 components, most untested
- No integration tests
- No visual regression tests

---

## High Priority Issues (P1)

### Manual Observers (6 files)
Files with `addObserver`:
- `app/models/array.js`
- `app/components/module-clock/model.js`
- `app/components/module-plonkmap/model.js`
- `app/components/port-group/model.js`
- `app/components/module-analyst/model.js`
- `app/components/module-value/model.js`

### Console.log Statements (26 instances)
- ESLint rule disabled: `'no-console': 'off'`
- Reduced from 57 to 26 during recent work
- Should use proper logging library or remove

### Outdated Dependencies
| Package | Current | Latest | Priority |
|---------|---------|--------|----------|
| eslint | 7.32.0 | 10.x | High |
| @ember/test-helpers | 3.3.1 | 5.4.1 | Medium |
| @glimmer/component | 1.1.2 | 2.0.0 | Medium |
| ember-cli | 5.12.0 | 6.x | Low |
| ember-resolver | 11.0.1 | 13.2.0 | Low |
| ember-template-lint | 5.13.0 | 7.9.3 | Medium |

---

## Medium Priority Issues (P2)

### Direct DOM Access (33 instances)
- `document.addEventListener/removeEventListener` usage
- `window.onresize` global mutation
- Risk: Hard to test, potential memory leaks

### .bind(this) Pattern (10 instances)
Files affected:
- `app/components/patch-diagram.js`
- `app/components/module-wrapper.js`
- `app/services/midi.js`
- `app/services/scheduler.js`
- `app/components/port.js`

### Missing Accessibility
- 0 ARIA attributes in 51 components
- No aria-label on interactive ports
- No role="button" on clickable elements
- Canvas component has no alternative text

### Module Initialization Duplication
- 23 module models repeat same initialization pattern
- Opportunity for base class extraction or decorator

### Sass @import Deprecation
- Currently silenced in ember-cli-build.js
- Should migrate to @use syntax

---

## Positive Findings

- Modern Octane patterns throughout (native classes, @tracked, @action)
- No jQuery dependency
- Proper modifier usage (did-insert, did-update)
- Well-structured MIDI integration
- Clear feature organization by module type
- Active maintenance with regular commits
- Document-based persistence with Dexie.js for fast local storage
- Up-to-date Ember Data 5.8 with WarpDrive integration
- Clean relationship management with explicit `inverse: null` pattern

---

## Recommended Action Plan

### Phase 1: Critical ✅ COMPLETE
1. ~~Replace ember-localforage-adapter~~ DONE
2. ~~Upgrade Ember Data to 5.x~~ DONE
3. Begin test coverage improvements

### Phase 2: High Priority (Current)
4. Remove manual observers (use @tracked)
5. Audit and remove console.log statements
6. Upgrade ESLint to v9+ (flat config)

### Phase 3: Medium Priority
7. Modernize binding patterns (remove .bind(this))
8. Improve accessibility (ARIA attributes)
9. Reduce module initialization duplication
10. Migrate Sass to @use syntax

---

## Architecture: Persistence Layer

The application uses a document-based storage architecture with WarpDrive/Ember Data 5.8:

### Components
- **DatabaseService** (`app/services/database.js`): Dexie.js wrapper for IndexedDB
- **ApplicationAdapter** (`app/adapters/application.js`): Custom Ember Data adapter
- **PatchSerializer** (`app/serializers/patch.js`): Full document serialization with explicit relationship management
- **AutoSaveService** (`app/services/auto-save.js`): Debounced persistence
- **WarpDrive Initializer** (`app/initializers/warp-drive.js`): Reactivity setup and deprecation handling

### Data Flow
1. Patches are stored as complete JSON documents (not normalized)
2. Embedded records (modules, ports, settings) are serialized within patches
3. When embedded records change, auto-save schedules a debounced patch save
4. On load, documents are deserialized into Ember Data records
5. Relationships use `inverse: null` for explicit, predictable behavior

### WarpDrive Configuration
- Build config in `ember-cli-build.js` via `@warp-drive/build-config`
- Reactivity via `@warp-drive/ember/install`
- Legacy request methods deprecation silenced (custom adapter doesn't use `store.request()`)

### Benefits
- Simpler data model (single table vs normalized)
- Ready for export/import functionality
- Future-ready for cloud sync
- Predictable relationship behavior with explicit management
- Modern Ember Data 5.x patterns

---

## Build Stats

**Production Build** (April 2026):
| Asset | Size | Gzipped |
|-------|------|---------|
| vendor.js | 440 KB | 131 KB |
| app.js | 262 KB | 37 KB |
| chunk (Ember Data) | 349 KB | 103 KB |
| app.css | 13 KB | 2.4 KB |

---

## Files to Monitor

| File | Concern |
|------|---------|
| `app/adapters/application.js` | Core persistence adapter |
| `app/serializers/patch.js` | Document serialization, relationship linking |
| `app/services/auto-save.js` | Debounced save coordination |
| `app/initializers/warp-drive.js` | WarpDrive setup, deprecation handling |
| `app/routes/application.js` | Load coordination |
| `.eslintrc.js` | Disabled rules to re-enable |
