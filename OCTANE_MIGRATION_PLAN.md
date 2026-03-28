# Ember Octane Migration Plan

## Current State Assessment (Updated 2026-03-27)

### Component Status
| Type | Count | Status |
|------|-------|--------|
| Glimmer Components | 41 | ✅ All Octane |
| Classic Components | 0 | ✅ All converted |

### Class Patterns
| Type | Count | Status |
|------|-------|--------|
| Models | 30 | ✅ Native classes |
| Serializers | 26 | ✅ Native classes |
| Services | 2 | ✅ Native classes |
| Adapters | 1 | ✅ Native class |
| Routes | 2 | ✅ Native classes |
| Controllers | 2 | ✅ Native classes |

### Legacy Patterns Status
| Pattern | Original Count | Remaining | Status |
|---------|---------------|-----------|--------|
| `Component.extend()` | 19 | 0 | ✅ Done |
| `Model.extend()` | 30 | 0 | ✅ Done |
| `Serializer.extend()` | 24 | 1* | ✅ Done |
| `this._super()` | 34 | 0 | ✅ Done |
| `computed()` | 21+ | 0 | ✅ Done |
| `actions:` hash | 3 | 0 | ✅ Done |
| `tagName`/`classNames` | 19 | 0 | ✅ Done |
| `addObserver()` | 19 | 0 | ✅ Done |
| `{{action}}` helper | ? | 1 | ⚠️ Minor |
| `this.send()` | 3 | 2 | ⚠️ Minor |

*Note: The 1 remaining `.extend()` in `app/serializers/application.js` is intentional for applying `EmbeddedRecordsMixin`

---

## Migration Phases

### Phase 1: Services & Adapter ✅ COMPLETE
**Scope**: 3 files
**Status**: Complete

Converted to native ES classes:
1. ✅ `app/services/midi.js`
2. ✅ `app/services/scheduler.js`
3. ✅ `app/adapters/application.js`

---

### Phase 2: Simple Classic Components ✅ COMPLETE
**Scope**: 10 components
**Status**: Complete

All converted to Glimmer components:
1. ✅ `add-module-menu-item/component.js`
2. ✅ `toggle-button/component.js`
3. ✅ `indicator-blinking/component.js`
4. ✅ `value-input-number/component.js` (removed - merged into base-value-input)
5. ✅ `value-input-string/component.js` (removed - merged into base-value-input)
6. ✅ `value-array-input-button/component.js`
7. ✅ `select-menu/component.js`
8. ✅ `select-by-title-menu/component.js`
9. ✅ `module-setting/component.js`
10. ✅ `module-setting-menu/component.js`

---

### Phase 3: Complex Classic Components ✅ COMPLETE
**Scope**: 9 components
**Status**: Complete

All converted to Glimmer components:
1. ✅ `patch-component/component.js`
2. ✅ `patch-settings/component.js`
3. ✅ `module-settings/component.js`
4. ✅ `port/component.js`
5. ✅ `port-setting/component.js`
6. ✅ `port-setting-bus-menu/component.js`
7. ✅ `value-input-fader/component.js`
8. ✅ `value-input-array/component.js`
9. ✅ `graph-canvas/component.js`

---

### Phase 4: Port Models ✅ COMPLETE (native classes)
**Scope**: 7 files
**Status**: Native classes complete, observers still present

All converted to native ES classes:
1. ✅ `app/components/port/model.js` - Native class (⚠️ has addObserver)
2. ✅ `app/components/port-event-in/model.js` - Native class
3. ✅ `app/components/port-event-out/model.js` - Native class
4. ✅ `app/components/port-value-in/model.js` - Native class (⚠️ has addObserver)
5. ✅ `app/components/port-value-out/model.js` - Native class
6. ✅ `app/components/port-group/model.js` - Native class (⚠️ has addObserver)
7. ✅ `app/models/port.js` - Native class

**Remaining**: 3 files still use `addObserver()` - see Phase 8

---

### Phase 5: Module Models ✅ COMPLETE (native classes)
**Scope**: 18+ files
**Status**: Native classes complete, some observers still present

All converted to native ES classes:
1. ✅ `app/components/module/model.js` - Native class
2. ✅ `app/components/module-array/model.js` - Native class (⚠️ has addObserver)
3. ✅ `app/components/module-clock/model.js` - Native class (⚠️ has addObserver)
4. ✅ `app/components/module-clock-div/model.js` - Native class
5. ✅ `app/components/module-sequence/model.js` - Native class (⚠️ has addObserver)
6. ✅ `app/components/module-sequence-euclidean/model.js` - Native class
7. ✅ `app/components/module-scale/model.js` - Native class (⚠️ has addObserver)
8. ✅ `app/components/module-switch/model.js` - Native class
9. ✅ `app/components/module-maybe/model.js` - Native class
10. ✅ `app/components/module-mute/model.js` - Native class
11. ✅ `app/components/module-value/model.js` - Native class (⚠️ has addObserver)
12. ✅ `app/components/module-repeat/model.js` - Native class (⚠️ has addObserver)
13. ✅ `app/components/module-in/model.js` - Native class (⚠️ has addObserver)
14. ✅ `app/components/module-out/model.js` - Native class (⚠️ has addObserver)
15. ✅ `app/components/module-ccout/model.js` - Native class
16. ✅ `app/components/module-analyst/model.js` - Native class (⚠️ has addObserver)
17. ✅ `app/components/module-button/model.js` - Native class
18. ✅ `app/components/module-merge-voices/model.js` - Native class
19. ✅ `app/components/module-plonkmap/model.js` - Native class (⚠️ has addObserver)
20. ✅ `app/components/module-bus/model.js` - Native class
21. ✅ `app/components/module-graph/model.js` - Native class
22. ✅ `app/components/module-analyst-graphable/model.js` - Native class

**Remaining**: 10 module files still use `addObserver()` - see Phase 8

---

### Phase 6: Data Models ✅ COMPLETE (native classes)
**Scope**: 3 files
**Status**: Native classes complete, some observers still present

All converted to native ES classes:
1. ✅ `app/models/patch.js` - Native class
2. ✅ `app/models/array.js` - Native class (⚠️ has addObserver)
3. ✅ `app/models/array-item.js` - Native class (⚠️ has addObserver)

**Remaining**: 2 files still use `addObserver()` - see Phase 8

---

### Phase 7: Serializers ✅ COMPLETE
**Scope**: 26 files
**Status**: Complete

All converted to native ES classes:
1. ✅ `app/serializers/application.js` (uses `.extend(EmbeddedRecordsMixin)` - intentional)
2. ✅ `app/serializers/patch.js`
3. ✅ `app/serializers/array.js`
4. ✅ Plus 23 component serializers - all native classes

---

### Phase 8: Observer Removal & Template Cleanup ✅ COMPLETE
**Scope**: 15 files with observers + 1 template
**Status**: Observers removed, minor template/controller items remain

#### `addObserver()` removal (15 files): ✅ COMPLETE

All observers have been converted using these patterns:
1. **Save-triggering observers** → UI components now trigger `requestSave()` after value changes
2. **Side-effect observers** → Converted to explicit setter methods (e.g., `setSource()`, `setPortSetsCount()`)
3. **Relationship observers** → Removed; `async: false` ensures relationships are available in `init()`
4. **Settings system** → Updated `ModuleSettingModel` to detect and use setter methods automatically

**Key architectural changes:**
- `BaseValueInputComponent` now calls `_triggerSaveIfNeeded()` after committing values
- `ModuleSettingModel` uses custom getter/setter that checks for setter methods
- `ValueInputFaderComponent` and `ValueArrayInputButtonComponent` trigger saves after updates

#### Remaining Minor Items (optional):
- [ ] Convert `{{action 'newPatch'}}` to `{{on "click" ...}}` in `app/templates/application.hbs`
- [ ] Convert `this.send()` calls in controllers (functional but could modernize)

---

## Observer Migration Strategy

Observers are the trickiest pattern to migrate. Strategies by use case:

### 1. Derived State → Getter
```javascript
// Before
fullName: computed('firstName', 'lastName', function() {
  return `${this.firstName} ${this.lastName}`;
})

// After
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}
```

### 2. Sync Side Effects → Setter
```javascript
// Before
onValueChanged: observer('value', function() {
  this.requestSave();
})

// After
@tracked _value;
get value() { return this._value; }
set value(val) {
  this._value = val;
  this.requestSave();
}
```

### 3. Async Side Effects → `@ember/render-modifiers` or Custom Modifier
```javascript
// Use did-update modifier in template for DOM-related side effects
{{did-update this.onValueChanged @value}}
```

### 4. Init-time Setup → Constructor
```javascript
// Before
init() {
  this._super(...arguments);
  this.set('items', []);
}

// After
constructor() {
  super(...arguments);
  this.items = [];
}
```

---

## Risk Mitigation

1. **Test after each file**: Run `npm test` after each conversion
2. **Manual testing**: Test UI interactions after each phase
3. **Git commits**: Commit after each successful file conversion
4. **Rollback plan**: Keep classic version commented if needed during transition
5. **Feature flags**: Consider feature flags for major component rewrites

---

## Dependencies Between Phases

```
Phase 1 (Services) ─────────────────────────────────────┐
                                                        │
Phase 2 (Simple Components) ────────────────────────────┤
                                                        │
Phase 3 (Complex Components) ───────────────────────────┤
                                                        ├──► Phase 8 (Templates)
Phase 4 (Port Models) ──────┐                           │
                            ├──► Phase 5 (Module Models)┤
Phase 6 (Data Models) ──────┘                           │
                                                        │
Phase 7 (Serializers) ──────────────────────────────────┘
```

**Critical path**: Port Models → Module Models (modules depend on ports)

---

## Estimated Scope

| Phase | Files | Complexity | Status |
|-------|-------|------------|--------|
| 1 | 3 | Low | ✅ Complete |
| 2 | 10 | Medium | ✅ Complete |
| 3 | 9 | High | ✅ Complete |
| 4 | 7 | Medium | ✅ Complete |
| 5 | 22 | High | ✅ Complete |
| 6 | 3 | Medium | ✅ Complete |
| 7 | 26 | Medium | ✅ Complete |
| 8 | 16 | Medium | ⚠️ In Progress |
| **Total** | **~96** | | **~90% Complete** |

---

## Success Criteria

- [x] Zero `Component.extend()` usage
- [x] Zero `Model.extend()` usage (except where mixing in required)
- [x] Zero `observer()` / `addObserver()` imports
- [x] Zero `computed()` usage
- [x] Zero `get(this, ...)` or `set(this, ...)` patterns
- [x] Zero `actions:` hash patterns
- [x] All templates using angle bracket invocation
- [ ] All event handlers using `{{on}}` modifier *(1 `{{action}}` remaining - minor)*
- [x] All tests passing
- [x] No new deprecation warnings (except ember-localforage-adapter)
