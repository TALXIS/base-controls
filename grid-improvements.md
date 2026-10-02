# Grid: what would make it friendlier to consume

Found while rewriting the Grid docs: eight readers mapped the current API from source, every page writer reported
what was awkward to document, and five reviewers then tried to refute each claim against the code. Everything below
survived that check (36 confirmed as stated, 11 corrected; nothing kept that was refuted). Paths are relative to
`src/controls/grid` unless they say otherwise.

## Fix first: bugs

| # | Bug | Where | Fix |
|---|---|---|---|
| 1 | **The inline ribbon throws on every row.** `GridControl` passes the provider cast as `Dataset`, and `GridInlineRibbonModel` calls `getDataProvider()` on it, which a provider does not have; the ribbon stays in its shimmer. Regressed in 054ed542. | `services/cells/GridControl.ts:114`, `inline-ribbon/GridInlineRibbonModel.ts:36` | Pass `Provider: { raw: IDataProvider }` and call `provider.retrieveRecordCommand(...)` in a `try/finally`. Add a test with a `_talxis_gridRibbonButtons` column on a memory provider. |
| 2 | **A save that throws spins forever.** `Record.save` has no `try/finally`: if `onRecordSave` (or its interceptor) rejects, the record stays `isSaving()`, the spinner never stops, `onAfterRecordSaved` never fires, and `GridField` leaves an unhandled rejection. | client-libraries `Record.ts:96-131`, `services/fields/GridField.ts:52-57` | Catch in `Record.save`, reset the counter in `finally`, resolve `{ success: false, errors: [{ message }] }`. Put `DataProvider.save`'s `setLoading(false)` in a `finally`. Catch in `GridField.setValue` too. |
| 3 | **Paste, cut, fill handle, Delete on a range — and Delete/Backspace on a single editable cell — silently do nothing.** Provider columns have `field` and a `valueGetter` but no `valueSetter`, so AG Grid writes `record[columnName]` as a plain property: no `setValue`, no validation, no dirty state, no auto-save, and the cell redraws its old value. The clipboard module leaves paste on. The editor path also writes the editor's stale initial value onto the record object the same way. | `services/columns/GridColumns.ts:169-193`, `modules/clipboard/createClipboardModule.ts:28-33` | Add `valueSetter: p => { field(p.data, col).setValue(p.newValue); return true }` plus per-type `valueParser`s, and save each touched record once on `pasteEnd` / `fillEnd` / `rangeDeleteEnd`. Until then default `suppressClipboardPaste` and `suppressCutToClipboard` to true and drop `enableFillHandle` from the options. |
| 4 | **Focusing a totals cell reports the first body row.** `_onCellFocused` resolves the record with `getDisplayedRowAtIndex(rowIndex)` and ignores `rowPinned`, so `onFocusedCellChanged` gets the wrong record and that row's commands light up. Same pattern in rows and editing. | `services/cells/GridCells.ts:212-216`, `services/rows/GridRows.ts:106-109`, `services/editing/GridEditing.ts:99-109` | Resolve pinned rows with `getPinnedBottomRow(i)` / `getPinnedTopRow(i)`. Skip `openDatasetItem` for summary records on double-click (`GridColumns.ts:285-287`). |
| 5 | **TaskGrid's Manage views dialog can never show "Delete".** Its grid has only a row model, so nothing selects and the command (visible only with a selection) never appears. | `task-grid/.../ViewManageDialog.tsx:65-71` | Add `rowSelection: createRowSelectionModule({ mode: 'multiple' })`. |
| 6 | **The grid state round-trip is dead.** Check-list and Task Grid still pass `state={props.state?.AgGridState}`, but nothing writes `AgGridState` since 054ed542, and the grid re-lays out widths and order from the provider anyway. | `check-list/components/grid/Grid.tsx:58`, `task-grid/components/grid/Grid.tsx:46` | Delete those lines and mark `IGrid.state` deprecated (see *Columns* below). |
| 7 | **Notification props misbehave.** `buttonProps.iconProps` wipes the notification's icon (spread order); a notification with exactly one action runs it and never shows its text or messages; the callout shows only `messages[0]`. | `modules/legacy-client-api-compatibility/GridLegacyClientApiCompatibility.ts:152-158`, `.../NotificationCalloutHost.tsx:36` | Spread `buttonProps` first and merge the icon last; open the callout whenever there is content; render every message. |
| 8 | **Public TSDoc says the opposite of the code.** `IGrid.enableEditing`: "read at mount, then `registerLockHook`" (hooks can only lock further). `IGrid.state`: covers sorting (the provider owns sorting). `IGridModules.clipboard`: "Copying rows" (rows are not copied by default). | `interfaces.ts:44,71`, `modules/interfaces.ts` | Rewrite the three lines. |
| 9 | **Saving a record breaks its files and images** (client-libraries). `Record.toRawData` writes `fileName` into `.filesizeinbytes`, `.mimetype` and `.fileurl`, and never writes the file or image value itself, and a successful save replaces the raw row with that result. After any save, a File cell loses its link and an Image cell shows `---`. The docs datasets carry the values across saves until this is fixed. | client-libraries `Record/Record.ts:281-292`, `Record.ts:124-127`, `DataProvider.ts:912-920` | Copy each file attribute from the `FileObject` it belongs to, and keep the value under `column.name`. |
| 10 | **Multi-select text matches substrings** (client-libraries). The formatted value runs `value.includes(option.Value)` on the comma-joined string, so a value of `10` also shows option `1`. Tags (with option set colours on) split correctly, so text and tags disagree. | client-libraries `Record/Field/Field.ts:270-273` | Split the value and compare numbers. |
| 11 | **Grouping leaves unreadable text behind a script's colours.** A legacy custom-formatting background also sets a contrasting text colour; while grouped, grouping resets the background but not the text, so a dark script background turns into white text on a white cell. | `GridLegacyClientApiCompatibility.ts:112-127`, `modules/grouping/GridGrouping.ts:312-324` | Part of item 5 below: grouping should not touch record cells. |
| 12 | **Small contract gaps.** `onError`'s `details` argument is never passed (the provider dispatches the message only); the `onOpenDatasetItem` interceptor never receives the `{ columnName }` context the value renderer hands `openDatasetItem`; `IGrid.enableNavigation`'s TSDoc omits that it also decides whether lookups, emails, phones, URLs and primary columns are links. | client-libraries `DataProvider.ts:94-100,153-158`, `interfaces.ts:46` | Pass both through, and fix the TSDoc. |
| 13 | **Ungrouping changes whether a column can be edited** (client-libraries). Grouping sets a column's `IsValidForUpdate` to false; `grouping.clear()` never restores it, so the column stays read-only after ungrouping, and `removeGroupBy()` sets it to `undefined`, so a column that was read-only before grouping becomes editable. | client-libraries `DataProvider.ts:503-525` | Remember the column's own value when grouping and restore it in both paths. |
| 14 | **A `colDefs` entry over a column the grid adds turns it into an "added" column.** The merge replaces the definition object, the grid then no longer recognises it as its own, and fills in what it gives added columns: the save status column, for example, gets the grid's header button. | `services/columns/GridColumns.ts:72-84,105-111` | Track the grid's own columns by `colId`, not by object identity. |
| 15 | **The Form docs' model builder crashed** — it rendered `Grid.Root` without `modules` and with the removed `selectableRows`. | `storybook/src/form/shared/ModelBuilderPanel.tsx` | Fixed in this change. |

## The ten changes that would help consumers most

### 1. Props that change should take effect — or say they did not
Nine props are copied at mount and later values are ignored without a word: `provider`, `modules` (with every module
option), `labels`, `state`, `enableEditing`, `enableNavigation`, `enableZebra`, `enableOptionSetColors`, `rowHeight`
(`services/settings/GridSettings.ts:37-65`, `services/runtime/GridRuntime.ts:94-129,184`). Every docs demo and every
in-house wrapper remounts with a `key`, which drops scroll, focus and save status.
- Now: a dev-only effect in `GridRoot` that warns once per prop: *"'enableEditing' changed after mount and is ignored;
  remount with a key"*. Mark every prop's TSDoc *Read at mount* or *Live*.
- Next: make the cheap ones live — zebra and option set colours through `cells.render()`, `rowHeight` through
  `setGridOption('rowHeight')` + `resetRowHeights()`, and `enableEditing` through `locks.setReadOnly()` (see 6).

### 2. Columns that rebuild without a data reload
Column definitions are rebuilt only when the api arrives and on each provider load (`GridRuntime.ts:213-226`);
`refreshAgGridOptions()` re-pushes the cached copy (`GridRuntime.ts:206`); callbacks in `colDefs` keep the closures of
the last build. A changed `colDefs` needs `provider.refresh()`, which refetches rows.
- Add `columns.refresh()` (rebuild + push, no fetch) and call it from `GridRoot` when `colDefs` changes key by key.
- Resolve `settings.cell.*` / `settings.header.*` callbacks through `getColDefs()[colId]` at call time, so the latest
  closure always runs — then docs can drop the "read state through refs" advice.

### 3. One way to redraw, and hooks that redraw themselves
Registering a hook redraws nothing (`utils/hook-registry/HookRegistry.ts:26-32`), and each kind of outside state needs
its own remedy: `cells.render()`, `headers.render()`, `resetRowHeights()`, a provider reload for column hooks,
`refreshAgGridOptions()`, nothing at all for surfaces (`components/surfaces/Surfaces.tsx:5-10`), and nothing for the
record-lock cache (`services/locked-records/GridLockedRecords.ts:21,93-100`).
- Schedule a batched redraw on every `register*` / unregister.
- Add `runtime.invalidate({ cells?, headers?, rowHeights?, columns?, locks?, surfaces? })` as the single entry point.
- Ship `useGridHook(register, hook, deps)` for components that add a hook: register, invalidate on deps change,
  unregister on unmount.

### 4. Tell summary rows apart from records
Group rows and the totals row are `IRecord`s and reach every hook, colDef callback, `rowSettings` callback and row
event. Every consumer writes the same `getSummarizationType() !== 'none'` guard; the showcase needed it five times.
- Export `getGridRowKind(record): 'record' | 'group' | 'total'`.
- Add `kind` to the cell, lock, validation and height hook params and to `onRowClicked` / `onCellDoubleClicked`.
- Optionally don't call consumer record-level callbacks for summary rows unless they opt in.

### 5. Consumer hooks should not lose to the built-ins by default
Hooks default to priority 0, before every module except legacy compatibility (`modules/priorities.ts`). Grouping
(60) then resets every record cell's background while grouped (`modules/grouping/GridGrouping.ts:312-324`), so a
consumer's colours and the zebra striping disappear the moment someone groups.
- Grouping should style group rows only, and decide "records sit on the plain surface while grouped" in the base
  theme before any hook runs (`services/cells/GridCellTheme.ts:39-48`).
- Export `GRID_HOOK_PRIORITY = { beforeModules: -100, default: 0, afterModules: 1000 }` so nobody hard-codes
  `GRID_MODULE_PRIORITY.grouping + 1`.

### 6. A real editing workflow without auto-save
With `enableAutoSave` off, nothing in the grid reads `isDirty` or `getDirtyRecordIds`: no dirty marker, no save bar,
no dirty event. The per-row save result lives in React state inside the cell (`components/record-save-indicator/
useRecordSaveStatus.ts:21`), so a failed row's red icon vanishes when it scrolls out of AG Grid's buffer; with row
selection the indicator replaces the checkbox; server field errors never reach the cells (`components/cells/
field-error/CellFieldError.tsx:14`); and the indicator is customised in two places depending on whether selection is on.
- `onDirtyChanged(dirtyRecordIds)` on `Grid.Root`, a dirty marker part on cells, and `saveAll()` / `discardAll()`
  helpers (with totals refresh).
- A `recordSaves` service: `getStatus(record)`, `getFailed()`, `clear(record?)`, `events.onStatusChanged`, read by the
  indicator and by a field's error display (`IGridField.getSaveError()`).
- One `components.recordSave` on `Grid.Root`, read by both the save column and the checkbox cell; draw the status
  beside the checkbox, not instead of it.
- `locks.setReadOnly(boolean)` for a period-closed switch (one grid-level state instead of a lock on every header),
  and `locks.refresh(record?)` to clear the record-lock cache.

### 7. Selection that behaves in an editable grid
A plain row click replaces the selection, in multiple mode and in editable grids alike — clicking into a cell to edit
it wipes the ticked rows (`modules/row-selection/GridRowSelection.ts:148,178-190`). Selection is spread over the
provider (get/set/clear), the module (an `onSelectionChanged` captured at mount) and the service (`selectRecords`,
`toggleRecord`, a single-slot interceptor that grouping already occupies).
- `createRowSelectionModule({ rowClick: 'replace' | 'toggle' | 'none' })`, defaulting to `'none'` when editing is on.
- One service API: `getSelectedRecordIds()`, `getSelectedRecords()`, `setSelectedRecordIds()`, `clear()`;
  `isRecordSelectable(record)`; a live `onSelectionChanged` prop on `Grid.Root`.
- A prioritised interceptor chain (`registerSelectRecordsInterceptor`) so a consumer no longer silently removes
  grouping's group-load limit.

### 8. View state: saved views, URL state, per-user layouts
There are no change events and no read/apply API for sorting, filtering, grouping and totals. Worse, the filtering
module rewrites the whole provider filter as an AND of one condition per column, so OR expressions, nested filters
and conditions on non-column attributes set from code are dropped on the first user filter
(client-libraries `ColumnFilter.ts:68-81`, `Filtering.ts:45-55`).
- `onViewChanged(view)`, `runtime.getViewState()`, `runtime.applyViewState({ sorting, filtering, groupBy, totals,
  expandedLevel })` with one refresh.
- Filtering writes only the conditions it owns and keeps the rest; `createFilteringModule({ baseFilter })` for a
  scope filter the user never sees.
- Column-name APIs instead of aliases: `grouping.groupBy(columnName)`, `grouping.ungroup(columnName)`,
  `aggregation.setTotal(columnName, fn | null)` — today `addGroupBy` ignores the alias it is given and
  `getAggregations()` returns `[]` when nothing is grouped.

### 9. Localize once
Labels are English only, and a localized grid needs `labels` on `Grid.Root` plus four more `labels` options on
sorting, filtering, grouping and aggregation. The Czech strings in `translations.ts` are not read by anything.
- Accept `labels: { ...grid, sorting?, filtering?, grouping?, aggregation? }` on `Grid.Root`, merged under each
  module's own option.
- Ship 1029 / 1033 packs picked from `pcfContext.userSettings.languageId`; turn `translations.ts` into those packs.

### 10. A first grid that just works
A first grid needs `PcfContextProvider` (it throws without one, and the error names `PcfContext.Provider`, which is
not exported), `initializeIcons()`, a bundler that handles CSS from `node_modules`, `provider.refresh()`, and —
with a memory provider — `IsValidForGrid: true` on every column, because sorting is the one feature whose metadata the
provider does not default (`modules/sorting/GridSorting.ts:52-54`). It then shows 50 rows with no pager, silently.
- Fall back to a sample PCF context with a one-time warning; fix the error text.
- `autoLoad?: boolean` (calls `refresh()` on mount when the provider never loaded).
- Treat `IsValidForGrid === undefined` as sortable, leaving the provider's `disableSorting` as the switch.
- Export a `Grid.Pager` (or a `paging` option) over `provider.getPaging()`; until then say "current page only, 50 by
  default" in the `provider` TSDoc.

## More, by area

### Setup and props
- **One mapping from dataset parameters.** Check-list and Task Grid copy the same PCF-parameter → props/modules
  mapping, and the Manage views dialog has a third, partial copy. Export
  `getGridPropsFromDatasetParameters(parameters, { rowModel?, custom?, licenseKey? })`, or a `<DatasetGrid>` default
  for `onGetControlComponent`.
- **Height rules.** The root's `min-height: 220px` overrides a smaller `height` (`styles.ts:32`), and the auto-height
  cap multiplies the *default* row height, so taller rows show fewer than `maxVisibleRows` (`styles.ts:18-20`). Apply
  the minimum only in auto-height mode, and measure the cap from real row heights (or add `maxHeight`).
- **Two "destroyed" signals with one name.** The `onDestroyed` prop fires before AG Grid tears down; the runtime's
  `onDestroyed` event fires after. Rename one (`onBeforeDestroyed` / `onDisposed`).
- **Theme switches are half applied.** Cells and headers use the theme captured at mount while the frame follows the
  live one (`GridRuntime.ts:101`). Resolve `theme` (and `pcfContext`) through a ref and redraw on change.

### Columns
- **Added columns are second-class.** A colDefs column without `cellRenderer` draws nothing (`GridColumns.ts:105-111`),
  lands after every other column with no position option, and is left out of layout write-back. Default it to a
  renderer that shows the `valueGetter` result, add `settings.position`, and include it in `onColumnsChanged`.
- **One per-column switch for module features.** `sortable: false` removes sorting, but filtering, grouping and totals
  ignore colDefs. Have each module read the colDef flag it already sets (`filter`, `enableRowGroup`, `enableValue`),
  and export the menu section keys as constants.
- **Retire `state`.** It is `initialState` only; widths are re-laid out from `visualSizeFactor`, order and sorting
  belong to the provider, and nothing writes it back. Deprecate it and document layout persistence through provider
  columns and `onColumnsChanged`.
- **Record links.** The primary-name column is not a link unless `isPrimary` is set, and there is no `Grid.Root`
  event when a record link is clicked — only the provider's `onOpenDatasetItem` interceptor. Default `isPrimary` from
  `PrimaryNameAttribute`, and add `onOpenRecord({ record, columnName, reference, source })`.
- **Wrapping vs. the resize grip.** Wrapping follows `isRowResizable`/`autoHeight`, and a dragged row height has no
  event and no reset. Split `wrapText` from `isRowResizable`, add `onRowHeightChanged` and `rows.resetRowHeight()`.

### Cells and theming
- **Computed cells go stale.** A value read in a `cellRenderer` body never updates after an edit; only components
  under `Grid.Cell.Root` that call `useGridCell` redraw. Let `Grid.Cell.Root` take a render prop
  `(cell) => ReactNode`, or export `useGridCellRecord()`.
- **Grid-wide cell parts.** There is no `components.cell` on `Grid.Root`, and only `onRenderControl` receives a
  `defaultRender`. Add `components.cell` / `components.cellEditor`, and give every `onRender*` the
  `(props, defaultRender)` shape.
- **Commands only on hover.** Cell commands — including script notifications, errors among them — draw only while the
  row is hovered, focused or selected. Add `visibility: 'always'` per command and a column default.
- **Contrast.** Setting a background does not set a readable text colour except in the legacy path. A
  `theme.setBackground(color, { autoContrast: true })` helper would remove the most common mistake.

### Editing
- **Escape commits.** It stops editing and the control commits what was typed (`services/editing/GridEditing.ts:68-80`).
  Snapshot the value on edit start and restore it on Escape (`editing.cancel(cell)`).
- **One lock hook, three levels, told apart by sniffing.** `registerLockHook` gets `{ columnName }`, `{ record }` or
  both. Make the context a discriminated union with `level: 'grid' | 'column' | 'record' | 'cell'` (and ask hooks about
  the grid level).
- **Validation that composes.** Grid validation hooks cannot see or relax built-in errors, and the grid overwrites the
  record's single validation expression (a script's validator included) on every validated column
  (`services/validation/GridValidation.ts:92-94`). Chain the previous expression and pass `defaultResult` to hooks.
- **Required has three sources.** The header marker, validation and the cell error each decide "required"
  differently, and required errors show in read-only grids. Derive all three from one function, and hide field errors
  when the grid itself is read-only.

### Modules
- **Per-grid AG Grid modules.** Every grid registers its AG Grid modules in the global registry, so one grid's
  Enterprise modules make every grid Enterprise, watermark included (`GridRuntime.ts:128-129`). Pass them through
  `<AgGridReact modules>`. The licence is global by AG Grid's design: say so, and accept an empty key.
- **Enterprise in the types.** Say "needs AG Grid Enterprise" in the four factories' TSDoc (server-side row model,
  grouping, cell selection, clipboard) and warn once in development when one is used without `license`.
- **Client-side grouping fetches the whole tree.** It loads every group at every level after each load, collapsed
  ones included, with no concurrency limit (`modules/row-model/client-side/ClientSideRowModelGrouping.ts:123-138`).
  Reuse grouping's 5-at-a-time loader and document when to switch to the server-side model.

### Legacy client API compatibility
- **Seven behaviours behind one opt-in, and silence without it.** Notifications, disabled → lock, loading, custom
  formatting, custom controls, control parameters, `IColumn.controls` and `requestRender()` all need the module; without
  it the expressions do nothing. Move `IColumn.controls` and `onRenderRequested` into core, make the rest granular
  (`{ notifications?, disabled?, loading?, formatting?, controls? }`), and warn in development when an expression is set
  without the module.

### Public surface and tooling
- **The barrel exports implementation classes** (`GridRuntime`, `GridCells`, `GridRows`, `GridLocks`, `GridColumns`,
  the module classes) while `IGridSettings` and `IGridKeyboard`, which appear in `IGridServiceMap`, cannot be imported.
  Export types only, plus the factories and constants.
- **Generate the docs sandbox types.** The Monaco declarations behind the live examples are a hand-written copy of the
  API and drift with every change. Generate them from the emitted `.d.ts` at build time; the snippet checker used for
  this rewrite (every example typechecked against both the sandbox declarations and the real types) is worth keeping
  in CI.

## Smaller papercuts met while writing the examples

Each was hit by a page writer, with the line it points at; these were not put through the separate verification pass.

- **Two-options values are strings.** `record.getValue()` returns `'1'` / `'0'` for two options (and strings for option
  sets), which invites `!!value` bugs — the old docs had three. A typed boolean accessor would remove them
  (client-libraries `Record/Field/Field.ts:353-367`).
- **Filter presets need the callout's wire format** — option set values as strings, `'%x%'` for Like, `YYYY-MM-DD`
  dates, a numeric `filterOperator` — and `SupportedFilterConditionOperators` only accepts a literal union, so a plain
  `number[]` table does not assign. A typed builder (`filtering.setColumnFilter(column, operator, value)`) fixes both.
- **A narrowed operator list opens blank** unless it repeats the condition class's fixed default operator; start on
  the first supported operator instead (client-libraries `extensions/filtering/conditions/Condition.ts:139`).
- **The filter callout's Apply and Clear are hard-coded English** (`dataset-control/filtering/DatasetColumnFiltering.tsx:178,184`).
- **Grouping adds a noisy count to the totals row.** With the aggregation module on, every grouped column gets a
  *Count (including empty values)* total, with no option to leave it out (client-libraries `DataProvider.ts:1146-1153`).
- **Switching nested/flat grouping needs a manual refresh** after the remount, because the type is written to the
  provider without one (`modules/grouping/GridGrouping.ts:111-112`); `setExpandedLevel` fires no event, so the
  expansion header and a toolbar disagree.
- **Subscriptions cannot be undone in one line.** `addEventListener` returns nothing, so every module keeps named
  handlers and repeats each subscription in an `onDestroyed` cleanup; return an unsubscribe function
  (client-libraries `helpers/events/EventEmitter.ts`). An interceptor cannot be removed per key either.
- **A module's own service still reads as optional.** A service a module registers can only be declared on
  `IGridOptionalServiceMap`, so the components that same module draws need a `!`.
- **Reaching the runtime from outside.** A toolbar only gets the runtime through `onGridReady` plus a ref; an
  `onRuntimeCreated` prop (or a `ref`) would let modules and toolbars share it without factories.
- **Row heights cannot be re-asked.** A row-height hook that depends on a value has to call
  `gridApi.resetRowHeights()` itself; add `rows.render()`.
- **The header is fixed at 42px**, so AG Grid's `headerHeight` option does nothing without replacing the header
  container (`components/column-header/ui/container/styles.ts:5-7`).
- **Option hooks overwrite grid-owned options silently** (`columnDefs`, `getRowHeight`, `rowClassRules`, `rowData`,
  `rowSelection`, `pinnedBottomRowData`); warn in development (`services/runtime/GridRuntime.ts:146-162`).
- **Surfaces have no placement**: every surface renders after the grid; a `placement: 'top' | 'bottom' | 'overlay'`
  would cover toolbars and footers.
- **`createLicenseModule` requires a key**, so every host writes `key ? createLicenseModule({ key }) : undefined`;
  accept an empty one.
- **Loading messages are cleared by `refresh()`**, so a host cannot say what the grid is waiting for
  (client-libraries `DataProvider.ts:325-328`).
- **The empty overlay takes no clicks**, so a call to action in it needs `pointer-events: auto` (AG Grid's overlay CSS).
- **The group count part gets a preformatted `(n)`**; pass `count: number` as well
  (`modules/grouping/components/ui/count/GroupingUiCount.tsx:19`).
- **Memory provider sorting and filtering quirks** (client-libraries, traced by a reviewer): two-options columns sort
  inverted (ascending puts *Yes* first while the menu reads *No to Yes*), and the date *Between* filter excludes both
  end days (`memory-provider/DataBuilder.ts` `_compare`, `memory-provider/filtering/DateCondition.ts`).
- **The production Storybook build is broken** by the Form docs, independent of the grid:
  `storybook/src/stories/form/XrmCustomComponentsLivePreview.tsx:4` imports `ControlComponents` from the package root,
  which does not export it. `npm run build-storybook` fails until it imports the deep path or the package exports it.
