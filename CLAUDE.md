# base-controls

## Browser use

Do not open the browser pane to test, click through, or visually verify changes unless the user directly
asks for it in that turn.

- Static checks (reading code, typechecking, running tests, linting) are fine on your own initiative.
- If you believe a browser check would be valuable, say so and ask, or state it as a suggestion — don't
  just go do it.

## Code comments

Default to **zero** comments. Code should carry its own meaning through naming and structure. A comment is
a cost: it has to be read, kept true, and updated forever. Write one only when the code cannot say it
itself.

### Write a comment only for

- **Why, not what.** A non-obvious decision, a trade-off, or a constraint that isn't visible in the code.
- **External forces.** Browser/API/library quirks, upstream bugs, spec requirements, workarounds — link the
  issue or spec.
- **Landmines.** Ordering requirements, invariants a future edit could silently break, "don't refactor this
  into X because Y".
- **Public API docs.** TSDoc on exported types, props, and functions consumers use — describe contract and
  behaviour, not implementation.

### Never write

- **Restatements.** `// increment counter` above `counter++`, or a header repeating the function name.
- **Change narration.** Anything about what you are doing right now: `// now uses the new hook`,
  `// refactored to`, `// added prop for`, `// removed the old implementation`. This context expires the
  moment the change merges.
- **History.** How it used to work, what the previous approach was, what was deleted. Git holds that.
- **Chat residue.** References to the conversation, the request, the ticket, the reviewer, "as discussed",
  "per your request".
- **Section banners and decoration.** `// ---- Helpers ----`, ASCII art, boxes.
- **Commented-out code.** Delete it.
- **Obvious TODOs.** No speculative `// TODO: maybe make this configurable`.
- **Design justification.** Why this shape rather than another shape the file does not contain. If the
  alternative isn't in the code, arguing against it is history.
- **Name restatements in TSDoc.** `isSaving` does not need `/** Whether it is saving. */`. Document the
  field the reader would guess wrong, not the four they would guess right.

### Style

**Hard limits. A comment that breaks one of these is wrong, however true it is.**

- **One line.** Never two. If it does not fit on one line, it is too long — cut it, don't wrap it.
- **Under 100 characters**, including the indent and the `//`.
- **One clause.** No `X, which is what Y`, no `X rather than Y`, no `A: B, and C`, no em-dash tails. If
  you are about to explain the alternative, the consequence, or the mechanism, stop at the first comma.
- **A TSDoc block is one short sentence.** No second sentence, no second paragraph, no blank `*` line.
  `@param`/`@returns` are the only things that may follow it.
- Plain, factual, present tense. No hedging, no enthusiasm, no explaining yourself to the reader.
- `//` for implementation notes, TSDoc `/** */` only for public API.
- Match the surrounding file's comment density — if the neighbouring code has no comments, that's the
  target.
- Comments are the exception, not an annotation layer. Past roughly one comment line in ten, you are
  writing prose where naming and structure should have carried it — and a short file with a long header is
  the same failure.

### The voice to avoid

These are all real comments that had to be deleted. The pattern is always the same: a fact, then a clause
explaining the fact, then a clause explaining the explanation.

```ts
//not the cell: a value written in a cell has the grid rebuild it, and the user is still in what it draws
//the row rather than the cell: AG Grid works an auto-height row out from what its cells measure, and an
//editor is not one of the cells it measures
/**
 * Whether the user is editing this cell, which is what its control is handed as `AutoFocus`.
 *
 * An editor is being edited from the moment AG Grid opens it - it was opened because the user asked to
 * type here. A cell drawing its control in place is being edited once the user steps into it.
 */
```

Write the first fact and stop:

```ts
//keyed by record and column: writing a value rebuilds the cell
//AG Grid measures the renderer, not the editor
/** Whether the user is editing this cell. */
```

### The survival test

Before keeping a comment, ask: **would this still be useful in a year to someone who never saw this diff?**
If not, delete it.

### When editing existing code

- Don't add comments to explain your edit.
- Do update or delete comments your edit made wrong or stale.
- Don't strip comments you didn't invalidate — someone wrote them for a reason.

## Layers

`src/` is layered; each layer imports only the ones before it. `npm run check:layers` enforces this.

| Layer | Holds |
|---|---|
| `core` | Plumbing with no look: generic hooks, state, events, service locator |
| `labels` | The labels framework: `defineLabels`, `LabelsProvider`, `useLabels`, `LabelsService` |
| `pcf` | The PCF contract: `context/`, `interfaces/`, `control/` (`useControl`…), `xrm/` shims |
| `theme` | Themes, colours, theme builder |
| `ui` | UI that takes only props, shared by more than one widget |
| `fields` | Field controls and the nested control renderer |
| `data` | Data provider context |
| `controls` | Widgets: `ribbon` → `dataset-control` → `grid` → `checklist`/`task-grid`; `form`, `map`, `isolated-frame` |
| `pcf/entries` | PCF entry points that render the controls from a PCF's `init`/`updateView` |
| `labels/sets` | Every part's label sets gathered (`BASE_CONTROLS_LABEL_SETS`, `CZECH_LABELS`); the top layer |

- `legacy` is a sidecar: only `fields`, `controls`, `pcf/entries` and `labels/sets` import it.
- The `@pcf` and `@labels` barrels leave out `entries` and `sets`; only the root index exports them.
- A widget's `modules/` may use any widget; a widget's own code follows the order above.
- Within a layer import by relative path; across layers or widgets use the alias (`@core`, `@controls/grid/...`).
- Never import your own layer's or widget's barrel.

### Adapter and UI

- **UI** takes plain props and owns the look: `styles.ts`, slots, default labels. It never reads a runtime,
  the PCF context or a store.
- **Adapter** reads the runtime and renders the UI with props. No styles.

### Inside a widget or module

| Folder | Holds |
|---|---|
| `<Widget>.tsx` | The drop-in component |
| `runtime/` | State and logic, no rendering; per-part classes in `runtime/parts/<part>` |
| `adapters/<part>/` | Reads the runtime, renders the UI part |
| `ui/<part>/` | `<Part>.tsx`, `styles.ts`, `components.tsx` |
| `modules/<module>/` | The same split; the module class and factory sit at its root |
| `labels/` | `en.ts` defines the labels, one file per translation (`cs.ts`), `index.ts` exports them |

Every folder with labels keeps them in a `labels/` folder, never as loose files.

### Widget namespace

A widget with UI parts is exported as a namespace, so consumers reach its adapters and plain UI from it:

- `<Widget>.tsx` exports `<Widget>Root`; `namespace.ts` exports
  `<Widget> = Object.assign(<Widget>Root, { …adapters, Ui })` typed `typeof <Widget>Root & I<Widget>Parts`.
- `ui/index.ts` declares `I<Widget>Ui` and exports `<Widget>Ui` holding every UI part.
- The widget's `index.ts` exports `./namespace` and the props type, never `<Widget>Root`.
- Follow `dataset-control/namespace.ts` and `dataset-control/ui/index.ts`.

## Vocabulary

One meaning per word, one word per meaning. A new name follows these tables; an external API keeps its own.

### Things

| Word | Means |
|---|---|
| runtime | A widget's state and logic with a lifecycle: `I<Widget>` (`IGrid`), class `<Widget>Runtime`, wider side `I<Widget>Internal` |
| module | An optional feature loaded through `modules`; a `modules/` folder holds only modules |
| part | A named piece of a widget: its UI and, optionally, the runtime object it provides |
| service | An object a runtime provides by key on its `services` |
| hook | A priority-ordered function that shapes a result; React hooks are `use…` and never called "hook" |
| slot | One replaceable piece of a `components` prop |
| surface | Something a module draws over or inside its host |
| store | Where something is kept: `IStateStore`, or a module's backend `I…Store` |
| provider | `IDataProvider`, or a React context provider; never "data source" |
| context | Only PCF, Xrm and React contexts, and AG Grid's `colDef.context` |

### Inputs

| Shape | Name |
|---|---|
| React component props | `I<Component>Props`, `props` |
| Any other input bag: constructor, factory, hook arguments, control inputs | `I<Thing>Parameters`, `parameters` |
| `Options` | Only Dataverse option sets and AG Grid's `GridOptions` |
| `Settings` | Only a runtime's resolved flags (`IGridSettings`) |
| `Config` | Only dhtmlx's `gantt.config` |
| `Params` | Only AG Grid's own `…Params` and types that extend them (`IGridCellParams`) |

### Functions handed to the library

Ask who calls it and when:

| Kind | Name |
|---|---|
| Plugged into another object's lifecycle, run once at a fixed point | `on<Stage>`: `onSetup`, `onLoad`, `onInit`, `onDestroy` |
| Notified that something happened; the return value is ignored | `on<Event>` |
| A render slot | `onRender<Slot>` |
| A method of an object you implement, called on request | a plain verb: `load`, `saveTask`, `deleteTasks` |
| Answers a question | `get…`, `is…`, `can…` |
| Makes something | `create…` |
| A per-column hook on a column definition | `<thing>Hook` |

The owner's trigger is the verb, and the logic plugged into it is `on<Verb>`: `lifecycle.init()` runs `onInit`.
A private field that holds or implements a callback is `_on<What>`.

### Extending

| Verb | Means | Returns |
|---|---|---|
| `x.hooks.<thing>.add(hook, priority?)` | Adds to a priority-ordered hook point typed `IHookPoint<<Host><Thing>Hook>` | its remover |
| `add<Thing>(thing)` | Adds an unordered contributor: a blocker, matcher, handler | its remover |
| `provide(key, service, { onDestroy })` | Puts a service on a registry; `onDestroy` releases it when it goes | its remover |
| `define<Thing>(…)` | Registers globally for good, like `defineLabels` | — |

`register` is never used. A `priority` is documented as
`@param priority Ascending: a higher number runs later.`

### Lifecycle verbs

| Verb | Means |
|---|---|
| `init()` | Only `RuntimeLifecycle` and the PCF contract |
| `configure(…)` | Sets something up before it loads |
| `load()` / `reload()` | Gets from the source: runs `onLoad`, or fetches |
| `refresh…()` | Re-applies hooks to what is loaded; `IDataProvider.refresh()` is the external exception |
| `render()` | Redraws |
| `remount()` | Drops the runtime and builds a new one |
| `mount(container)` | Attaches to a DOM element |
| `attach(x)` | Connects to something and returns its detach |
| `destroy()` | Tears down |

### Events

| Kind | Name |
|---|---|
| A fact | `on<Subject><Participle>`: `onTasksCreated`, `onDestroyed` |
| A state change | `on<Subject>Changed` |
| An ask | `on<Verb>Requested` |
| A failure | `on<Verb>Failed` |
| A pair | `onBefore<Verb>` / `onAfter<Verb>`, the verb stem |
| A map a runtime emits | `I<Owner>Events` |
| A map bridged to props | `I<Widget>EventProps` |

- One event name has one signature everywhere.
- A public interface exposes `readonly events: IEventSubscriber<…>`; `IEventEmitter` stays private.
- An event's TSDoc reads `Fires when …`.

### Other names

| Kind | Rule |
|---|---|
| Feature flag | `enable<Feature>`, read back as `is<Feature>Enabled()` |
| State on a data object | A bare adjective: `disabled`, `hidden` |
| Predicate | Returns a boolean; anything else is a `get…` |
| A widget's or module's UI | Namespace `<Area>Ui`, component `<Area>Ui<Part>`; the shared `ui` layer keeps plain names |
| React accessor | `use<Thing>()` throws outside its provider, `useOptional<Thing>()` returns `undefined` |
| React context hook | `use<Thing>Context()` only when it hands back the whole context value |
| Wider in-library interface | `…Internal`, always a suffix |
| CSS class constant | `…_CLASS` |
| Spelling | `checklist`, one word |

## Component codestyle

Follow these conventions when creating or restructuring components.

### Folder structure

- Put every component in its own folder.
- Name component folders in **kebab-case**.
- Name the main component file in **PascalCase** and match the component name.
- Add a local `index.ts` in every component folder with:

```ts
export * from './ComponentName';
```

- Use folder-level `index.ts` files as export boundaries when a subtree has multiple related components.
- Name colocated React context files `context.ts`.

### Component shape

- Name props interfaces `I<ComponentName>Props`.
- Define the props interface in the main component file by default.
- Name the component parameter `props`.
- Avoid separate `interfaces.ts` files for a component unless there is a clear reason.

### Styling

- Keep component styles in a colocated `styles.ts` file instead of inline style objects.
- Build styles with `mergeStyleSets` from `@fluentui/react`.
- Name the style factory `get<ComponentName>Styles`.
- Call the style factory inside `useMemo`.

### Overridable UI

- Only add overridable UI scaffolding when the component actually needs it.
- When used, define `I<ComponentName>Components` and its defaults in a `components.tsx` next to the component.
- Export it from the component folder's `index.ts`.
- Merge default and user-provided component mappings in the component body.
- Do not add `onRender...` callback scaffolding unless explicitly requested.

### Event handlers

- Register a handler longer than one line as a named arrow function property, not inline — a named
  reference can be removed again, and the registration site stays a readable list of what is listened to.
- Keep an inline arrow only for a single-line delegation to a named method.
- Name the property after the event: `_onGanttReady`, `_onPointerDown`.
- Use an arrow property rather than a method so `this` survives being passed as a listener, and so
  `removeEventListener` is handed the same reference that was added.

### Free functions vs methods

- Pull a method out of a class only for a reason that survives review: it is **pure** (values in, values
  out, no state and no chart/service) and the class is easier to read without it, it is **shared** by more
  than one consumer, or it **isolates a foreign API** so every reach into someone else's internals has one
  file to check on upgrade.
- "This method got long" is not one of those reasons. A long private method stays a private method.
- Never export a helper whose only caller is one class. Folder `index.ts` files are the package's public
  surface — publish what other parts read, keep the rest folder-internal.
