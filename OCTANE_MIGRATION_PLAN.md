# Ember Octane Migration Plan

## Current State Assessment

### Component Status
| Type | Count | Status |
|------|-------|--------|
| Glimmer Components | 23 | Already Octane |
| Classic Components | 19 | Need migration |

### Class Patterns
| Type | Count | Pattern |
|------|-------|---------|
| Models | 30 | `.extend()` → native class |
| Serializers | 24 | `.extend()` → native class |
| Services | 2 | `.extend()` → native class |
| Adapters | 1 | `.extend()` → native class |
| Routes | 2 | Already native class |
| Controllers | 2 | Already native class |

### Legacy Patterns Found
- **Observers**: 19 files (need conversion to `@tracked` + effects)
- **Computed properties**: 21+ files (need conversion to getters)
- **`get()`/`set()` imports**: 33 files
- **`this._super()`**: 34 files
- **`actions:` hash**: 3 files
- **`this.send()`**: 3 files
- **`tagName`/`classNames`/`classNameBindings`**: 19 classic components

---

## Migration Phases

### Phase 1: Services & Adapter (Low Risk)
**Scope**: 3 files
**Risk**: Low - isolated, easily testable

Convert to native ES classes:
1. `app/services/midi.js`
2. `app/services/scheduler.js`
3. `app/adapters/application.js`

**Pattern**:
```javascript
// Before
export default Service.extend({
  property: null,
  init() { this._super(...arguments); },
  myMethod() { set(this, 'property', value); }
});

// After
export default class MidiService extends Service {
  @tracked property = null;
  myMethod() { this.property = value; }
}
```

---

### Phase 2: Simple Classic Components (Medium Risk)
**Scope**: 10 components
**Risk**: Medium - UI-facing but straightforward

Convert components that have minimal state and simple templates:
1. `add-module-menu-item/component.js`
2. `toggle-button/component.js`
3. `indicator-blinking/component.js`
4. `value-input-number/component.js`
5. `value-input-string/component.js`
6. `value-array-input-button/component.js`
7. `select-menu/component.js`
8. `select-by-title-menu/component.js`
9. `module-setting/component.js`
10. `module-setting-menu/component.js`

**Key changes**:
- Remove `tagName`, add wrapper element in template
- Convert `classNames`/`classNameBindings` to template classes
- Convert `attributeBindings` to template attributes
- Convert `actions:` hash to `@action` methods
- Replace `this.get()`/`this.set()` with direct property access and `@tracked`
- Convert observers to derived state or constructor effects

---

### Phase 3: Complex Classic Components (Higher Risk)
**Scope**: 9 components
**Risk**: Higher - stateful, interconnected

Convert components with complex state management:
1. `patch-component/component.js` - Main orchestrator (highest complexity)
2. `patch-settings/component.js`
3. `module-settings/component.js`
4. `port/component.js`
5. `port-setting/component.js`
6. `port-setting-bus-menu/component.js`
7. `value-input-fader/component.js`
8. `value-input-array/component.js`
9. `graph-canvas/component.js`

**Special considerations for `patch-component`**:
- Has many `this.send()` calls - convert to direct method calls
- Complex action handling - refactor to `@action` decorators
- State management for diagram, modules, connections

---

### Phase 4: Port Models (Medium Risk)
**Scope**: 7 files
**Risk**: Medium - core to module connectivity

Convert port models that handle connections:
1. `app/components/port/model.js` - Base port model
2. `app/components/port-event-in/model.js`
3. `app/components/port-event-out/model.js`
4. `app/components/port-value-in/model.js`
5. `app/components/port-value-out/model.js`
6. `app/components/port-group/model.js`
7. `app/models/port.js`

**Key challenges**:
- Observers on `isEnabled` and attribute changes
- Computed properties for `uniqueCssIdentifier`, `compatibleType`
- `requestSave()` side effects

---

### Phase 5: Module Models (Higher Risk)
**Scope**: 18 files
**Risk**: Higher - core business logic

Convert the base module model and all module types:
1. `app/components/module/model.js` - Base module (do first)
2. `app/components/module-array/model.js`
3. `app/components/module-clock/model.js`
4. `app/components/module-clock-div/model.js`
5. `app/components/module-sequence/model.js`
6. `app/components/module-sequence-euclidean/model.js`
7. `app/components/module-scale/model.js`
8. `app/components/module-switch/model.js`
9. `app/components/module-maybe/model.js`
10. `app/components/module-mute/model.js`
11. `app/components/module-value/model.js`
12. `app/components/module-repeat/model.js`
13. `app/components/module-in/model.js`
14. `app/components/module-out/model.js`
15. `app/components/module-ccout/model.js`
16. `app/components/module-analyst/model.js`
17. `app/components/module-button/model.js`
18. `app/components/module-merge-voices/model.js`

**Pattern for models**:
```javascript
// Before
export default Module.extend({
  type: 'module-clock',
  tempo: attr('number', { defaultValue: 120 }),
  onTempoChanged: observer('tempo', function() { ... }),
  computedThing: computed('a', 'b', function() { ... })
});

// After
export default class ModuleClock extends Module {
  @attr('number', { defaultValue: 120 }) tempo;

  get computedThing() {
    return this.a + this.b;
  }

  // Observer → effect in appropriate lifecycle or setter
}
```

---

### Phase 6: Data Models (Medium Risk)
**Scope**: 3 files
**Risk**: Medium - data layer

Convert remaining data models:
1. `app/models/patch.js`
2. `app/models/array.js`
3. `app/models/array-item.js`

---

### Phase 7: Serializers (Medium Risk)
**Scope**: 24 files
**Risk**: Medium - affects data persistence

Convert all serializers to native classes:
1. `app/serializers/application.js` (uses `EmbeddedRecordsMixin`)
2. `app/serializers/patch.js`
3. `app/serializers/array.js`
4. Plus 21 component serializers

**Note**: `EmbeddedRecordsMixin` must be preserved - use with `class extends`:
```javascript
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class ApplicationSerializer extends JSONSerializer.extend(EmbeddedRecordsMixin) {
  // ...
}
```

---

### Phase 8: Template Cleanup (Low Risk)
**Scope**: ~10 templates
**Risk**: Low - syntactic changes

1. Convert remaining `{{action}}` helpers to `{{on}}` modifiers
2. Ensure all component invocations use angle brackets
3. Remove any `this.` prefix in templates where unnecessary
4. Update any remaining curly-brace helper patterns

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

| Phase | Files | Complexity |
|-------|-------|------------|
| 1 | 3 | Low |
| 2 | 10 | Medium |
| 3 | 9 | High |
| 4 | 7 | Medium |
| 5 | 18 | High |
| 6 | 3 | Medium |
| 7 | 24 | Medium |
| 8 | ~10 | Low |
| **Total** | **~84** | |

---

## Success Criteria

- [ ] Zero `Component.extend()` usage
- [ ] Zero `Model.extend()` usage (except where mixing in required)
- [ ] Zero `observer()` imports
- [ ] Minimal `computed()` usage (only computed macros where beneficial)
- [ ] Zero `get(this, ...)` or `set(this, ...)` patterns
- [ ] Zero `actions:` hash patterns
- [ ] All templates using angle bracket invocation
- [ ] All event handlers using `{{on}}` modifier
- [ ] All tests passing
- [ ] No new deprecation warnings (except ember-localforage-adapter)
