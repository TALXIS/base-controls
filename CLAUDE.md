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

## Component codestyle

Follow these conventions when creating or restructuring components in `src/components`.

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
- When used, keep the defaults in a local `components/` subfolder.
- Define `I<ComponentName>Components` in `components/components.tsx`.
- Export the defaults through `components/index.ts`.
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
