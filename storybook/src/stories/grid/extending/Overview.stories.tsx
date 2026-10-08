import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { docsOnlyStory } from '../../task-grid/docsOnlyStory'

const DESCRIPTION = `
The grid is made of services, and their decisions run through hooks you can register. The built-in modules use the same services and hooks you do, so a module of your own can change what the grid draws, follow what happens in it, add a service and draw its own UI.

This page is the reference. [**Hooks**](?path=/docs/grid-extending-hooks--overview) shows each common hook solving a real problem, [**Write a module**](?path=/docs/grid-extending-write-a-module--overview) builds a module from start to finish, and [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview) covers what no hook does.

## The runtime

Each mounted grid has one runtime, an \`IGridRuntime\`. You are handed it in three places:

| Where | When | What it is for |
|---|---|---|
| A module's \`onRegister(runtime)\` | Once, as the grid mounts: before AG Grid exists and before the first row is drawn | Registering hooks, services and listeners. Pass the module in \`modules.custom\`. |
| \`onGridReady(runtime)\` on \`<Grid.Root />\` | Once, when AG Grid is ready | Keeping the runtime for code outside the grid, such as a toolbar. |
| \`onDestroyed(runtime)\` on \`<Grid.Root />\` | Once, as the grid unmounts, while AG Grid still answers | Reading what you want to keep. See [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview). |

| Member | What it is |
|---|---|
| \`services\` | Every part of the grid, by key. See *Services* below. |
| \`events\` | \`onDataLoaded\` and \`onDestroyed\`. See *Events* below. |
| \`registerAgGridOptions\`, \`registerAgGridInitialOptions\`, \`refreshAgGridOptions\` | AG Grid's own options. See [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview). |
| \`openRecord(params)\` | Opens a record as a double-click does: through \`onOpenRecord\` when the grid has one. |

Inside anything the grid draws, such as a custom cell, a header part, an overlay or a surface, read a service with \`useGridService(key)\`:

- It works only inside the grid's own React tree. In the component that renders \`<Grid.Root />\`, it throws.
- A service every grid has is there on the first render. An optional one is \`undefined\` until something registers it, and the component renders once more when it arrives.
- It hands you the service, not its state. To draw again when the service changes, subscribe to it, as the bar on [**Write a module**](?path=/docs/grid-extending-write-a-module--overview) does.

## Services

\`runtime.services\` finds a service by its key:

| Call | Returns |
|---|---|
| \`get(key)\` | The service. It throws when nothing registered one, so use it for the services every grid has. |
| \`find(key)\` | The service, or \`undefined\`. Use it for a module's service, which may be off, and for \`gridApi\` and \`gridRoot\` before the grid is mounted. |
| \`whenAvailable(key, callback)\` | Nothing. It calls \`callback\` with the service as soon as there is one: straight away when it is there, or the moment something registers it. It calls back at most once, and never for a service nobody registers. |
| \`register(key, resolve)\` | Nothing. It registers a service, or replaces the one under that key: see *A service of your own* on [**Write a module**](?path=/docs/grid-extending-write-a-module--overview). |

Once the grid has unmounted, \`find\` returns \`undefined\`, \`get\` throws, and \`register\` and \`whenAvailable\` do nothing.

### In every grid

| Key | What it is |
|---|---|
| \`provider\` | The provider the grid mounted with. |
| \`settings\` | The props with their defaults applied. \`isNavigationEnabled()\`, \`isZebraEnabled()\`, \`areOptionSetColorsEnabled()\` and \`getDefaultRowHeight()\` answer as the grid mounted; \`getMaxVisibleRows()\`, \`getHeight()\`, \`getColDefs()\` and \`getRowSettings()\` answer with the current props. |
| \`labels\` | The grid's strings, with \`labels\` applied: \`getLocalizedString(key)\`. |
| \`theme\` | The Fluent theme the grid mounted in. |
| \`gridTheme\` | The AG Grid theme made from it, and the root element's styles: \`registerTheme\`, \`registerStyles\`. See *The AG Grid theme* on [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`pcfContext\` | The PCF context the grid mounted with. |
| \`cells\` | Every cell on screen: \`render()\`, \`getCells()\`, \`getCell(record, columnName)\`, the cell hooks and \`events\`. |
| \`rows\` | The rows: \`isHighlighted(record)\`, true while the row is hovered, focused or selected; \`setRowHeight(record, height)\`; the row height hook; and the row events. |
| \`columns\` | The column definitions: \`getColumnDefinitions()\`, which builds them from the provider's columns with every hook and \`colDefs\` applied; the column definitions hook; \`events\`; and \`headers\`, which has \`render()\` and the header hooks. |
| \`fields\` | One column of one record: \`get(record, columnName)\` hands an \`IGridField\` with \`getValue()\`, \`getFormattedValue()\`, \`isValid()\` and \`setValue(value)\`, which saves the record when auto-save is on. |
| \`editing\` | With the editing module only. \`isEditing(record, columnName)\`, \`isEditorAvailable(record, colDef)\`, \`start(cell)\`, \`finish(cell)\`, \`isAutoSaveEnabled()\`, \`events\`, and \`locks\`: \`locks.get({ record?, columnName? })\` answers \`{ isLocked, lockedBy? }\`. See *Locks* on [**Editing**](?path=/docs/grid-modules-editing--overview). |
| \`validation\` | \`get({ record, columnName })\` answers what the validation hooks and the column's \`onGetValidation\` decide, as an \`IFieldValidationResult\`, without the built-in checks; and the validation hook. |
| \`keyboard\` | \`onKeyDown(handler)\` calls \`handler\` for every key pressed inside the grid, before AG Grid and the focused control see it, and returns a function that stops it. \`getKeyBeingPressed()\` is the \`KeyboardEvent\` of the key held down, if any. |
| \`surfaces\` | What modules draw inside the grid: the surface hook, and \`getSurfaces()\`. |
| \`rowModel\` | The row model module's service. Its \`type\` is \`'clientSide'\` or \`'serverSide'\`. |
| \`grid\` | The runtime itself. |

### Only with what registers them

| Key | What it is | There |
|---|---|---|
| \`gridRoot\` | The grid's root element | Once it is mounted |
| \`gridApi\` | AG Grid's \`GridApi\` | Once AG Grid is ready. See [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview). |
| \`rowSelection\` | The selection | With \`modules.rowSelection\`. Members on [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview). |
| \`sorting\`, \`filtering\` | The sorting and the filters | With \`modules.sorting\` and \`modules.filtering\`. Members on [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview). |
| \`grouping\`, \`aggregation\` | The grouping and the totals | With \`modules.grouping\` and \`modules.aggregation\`. Members on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview). |
| Your own | Whatever your module registers | With your module in \`modules.custom\`. See [**Write a module**](?path=/docs/grid-extending-write-a-module--overview). |

## Hooks

A hook is a function you register on a service. Whenever the grid needs the answer, it hands your hook a result to change in place, and uses what the hooks leave. Every \`register...\` call takes an optional \`priority\`, described below, and returns a function that takes the hook off again.

| Service | Hook | What it decides | Handed | Then, last |
|---|---|---|---|---|
| \`cells\` | \`registerCellTheme\` | A cell's colours: set \`theme.colors\`, or change the built theme with \`theme.edit(key, edit)\` | \`theme: ThemeBuilder\`, \`{ record, columnName }\` | \`context.cell.onGetTheme\` |
| \`cells\` | \`registerCellLoading\` | Whether a cell draws a shimmer in place of its value: \`result.isLoading\` | \`result: IGridCellLoading\`, \`{ record, columnName }\` | \`context.cell.onGetLoading\` |
| \`cells\` | \`registerCellCommands\` | The commands a cell offers while its row is hovered, focused or selected: push to \`result.items\` or \`result.overflowItems\` | \`result: IGridCellCommands\`, \`{ record, columnName }\` | \`context.cell.onGetCommands\` |
| \`cells\` | \`registerControl\` | Which control draws a cell: \`result.control.name\` and its \`bindings\` | \`result: { control }\`, \`{ record, columnName, takesInput }\` | |
| \`cells\` | \`registerControlParameters\` | The parameters a cell's control is handed, such as \`Placeholder\` | \`result: IParameters\`, \`{ record, columnName, takesInput }\` | \`context.cell.onGetControlParameters\` |
| \`rows\` | \`registerRowHeight\` | A row's height, in pixels: \`result.height\` | \`result: IGridRowHeight\`, \`{ record, node }\` | \`rowSettings.onGetHeight\`. A height set with \`rows.setRowHeight\` wins over both. |
| \`editing.locks\` | \`registerLock\` | Whether a column, a record's row or a cell is locked: \`result.isLocked\` | \`result: IGridLock\`, \`{ record?, columnName? }\` | \`rowSettings.onGetLock\` for a row, \`context.cell.onGetLock\` for a cell |
| \`validation\` | \`registerValidation\` | Whether a value is valid: \`result.error\` and \`result.errorMessage\` | \`result: IFieldValidationResult\`, \`{ record, columnName }\` | \`context.cell.onGetValidation\` |
| \`columns\` | \`registerColumnDefinitions\` | The column definitions AG Grid is handed: change, add, remove or reorder the entries. Read a definition's \`context\` with \`getColumnContext(colDef)\`. | \`columnDefs: ColDef<IRecord>[]\` | \`colDefs\` |
| \`columns.headers\` | \`registerColumnMenuSection\` | The sections of a column's menu, each a heading and its items | \`sections: IColumnMenuSection[]\`, \`header: IGridColumnHeader\` | \`context.header.onGetMenuSections\` |
| \`columns.headers\` | \`registerColumnMenuItems\` | The menu's items once the sections are laid out, headings included | \`items: IContextualMenuItem[]\`, \`header\` | \`context.header.onGetMenuItems\` |
| \`columns.headers\` | \`registerColumnHeaderAdornments\` | What a header draws before and after the column's name | \`adornments: IColumnHeaderAdornment[]\`, \`header\` | \`context.header.onGetAdornments\` |
| \`columns.headers\` | \`registerColumnHeaderTheme\` | A header's colours | \`theme: ThemeBuilder\`, \`header\` | \`context.header.onGetTheme\` |
| \`surfaces\` | \`registerSurface\` | What modules draw inside the grid, after the rows: push \`{ key, onRender }\` | \`surfaces: IGridSurface[]\` | |
| \`filtering\` | \`registerFilterControlParameters\` | The parameters of the filter callout's controls | \`result: IParameters\`, \`{ column, control, index }\` | |
| The runtime | \`registerAgGridOptions\` | The AG Grid options that can change at any time | \`result: { options }\` | |
| The runtime | \`registerAgGridInitialOptions\` | The AG Grid options read once, when AG Grid is created | \`result: { options }\` | |
| \`gridTheme\` | \`registerTheme\` | The AG Grid theme: replace \`result.theme\`, for example with \`result.theme.withParams({ ... })\` | \`result: IGridAgTheme\`, \`fluentTheme\` | |
| \`gridTheme\` | \`registerStyles\` | Styles of the grid's root element, after the grid's own: push an \`IStyle\` | \`result: IGridStyles\`, \`fluentTheme\` | |

*Then, last* is the column's or the row's own callback, which runs after every hook of its kind, so the column has the last word. They are set through \`colDefs\` and \`rowSettings\`: see [**Columns**](?path=/docs/grid-columns-overview--overview). The colour and theme hooks are covered on [**Appearance**](?path=/docs/grid-appearance--overview), and the filter callout's on [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview).

## Priorities

Hooks of one kind run in ascending priority: a lower number runs first, so a higher one has the later word. Hooks with the same priority run in the order they were registered, and the built-in modules register before yours.

- The default is \`0\`. That runs before every built-in module except the legacy client API module, which also runs at \`0\` and registers first. A built-in module that sets the same thing later overwrites what your hook set.
- To act after module *x*, register at \`GRID_MODULE_PRIORITY.x + 1\`. For which module paints which colour, see *Which colour wins* on [**Appearance**](?path=/docs/grid-appearance--overview). A negative priority runs before the legacy client API module.
- Whatever the priority, the column's and the row's own callbacks run after the hooks, and \`colDefs\` after every column definitions hook.

| \`GRID_MODULE_PRIORITY\` key | Value | Hooks the module registers |
|---|---|---|
| \`legacyClientApiCompatibility\` | \`0\` | Cell theme, loading, commands, control and control parameters; lock; surface |
| \`rowModel\` | \`10\` | AG Grid options: the rows |
| \`editing\` | \`15\` | Column definitions: the save and lock columns, \`isLocked\` and \`isRequired\`; adornment; AG Grid options; root styles |
| \`rowSelection\` | \`20\` | Column definitions: the checkbox column; AG Grid options: \`rowSelection\` |
| \`cellSelection\` | \`30\` | AG Grid options |
| \`sorting\` | \`40\` | Column definitions: \`sortable\`; menu section; adornment |
| \`filtering\` | \`50\` | Menu section; adornment; surface |
| \`grouping\` | \`60\` | Column definitions: grouped columns first and pinned; cell theme; lock; menu section; adornment; surface; AG Grid options |
| \`aggregation\` | \`70\` | Column definitions; cell theme, loading and row height of the totals; menu section; adornment; AG Grid options and theme: the totals row |
| \`clipboard\` | \`80\` | AG Grid options |

## Events

Services tell you what happens through events. Subscribe with \`addEventListener(event, callback)\`, and stop with \`removeEventListener(event, callback)\` and the same function: neither returns an unsubscribe function.

| Emitter | Event | Arguments | Fires |
|---|---|---|---|
| \`runtime.events\` | \`onDataLoaded\` | None | After every load of the provider, once the grid has its new columns and rows; and when AG Grid is ready, if the provider had already loaded. |
| \`runtime.events\` | \`onDestroyed\` | None | As the grid unmounts, once AG Grid has gone. Remove your provider listeners here. |
| \`rows\` | \`onRowClicked\` | \`record\` | A row with a record is clicked, group rows and the totals row included. |
| \`rows\` | \`onHighlightedRowsChanged\` | None | The hovered, focused or selected rows change. |
| \`cells.events\` | \`onFocusedCellChanged\` | \`record?\`, \`columnName?\` | A cell takes focus, or the focus leaves the rows. |
| \`editing.events\` | \`onEditedCellChanged\` | \`previous?\`, \`next?\`, each \`{ recordId, columnName }\` | An editor opens or closes, or the user steps into or out of a one-click cell. |
| \`columns.events\` | \`onCellDoubleClicked\` | \`record\`, \`columnName\` | A cell of a provider column is double-clicked, whether or not the record then opens. |
| \`columns.events\` | \`onColumnsChanged\` | \`columns: IColumn[]\` | The user resized or moved a column, and the provider holds the result. |
| \`rowSelection.events\` | \`onSelectionChanged\` | \`selectedRecordIds: string[]\` | The selection changes. See [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview). |
| \`filtering.events\` | \`onFilterOpened\` | \`columnName\` | A column's filter callout opens. |
| \`filtering.events\` | \`onFilterClosed\` | None | The filter callout closes. |
| \`grouping.events\` | \`onGroupSelectionLimitDialogChanged\` | None | The dialog that refuses a selection of too many groups opens or closes. |
| \`events\` of each \`IGridColumnHeader\` | \`onMenuVisibilityChanged\` | \`isOpen\` | The header's menu opens or closes. |

- The grid's own events also reach \`<Grid.Root />\` as props, and a module's through its options, listed with the order they fire in on [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview). The service events suit a module, which has no props.
- No event fires when sorting, filters, grouping or totals change. Sorting, filters and grouping reload the provider, so follow \`onDataLoaded\` and read the provider.
- The provider has events of its own, such as \`onRecordColumnValueChanged\`, \`onAfterRecordSaved\` and \`onNewDataLoaded\`: \`runtime.services.get('provider').addEventListener(...)\`. Remove them on \`onDestroyed\`: see *Cleaning up* on [**Write a module**](?path=/docs/grid-extending-write-a-module--overview).
- \`keyboard.onKeyDown(handler)\` is not an event: it returns the function that stops it.

## Redrawing

The grid asks your hooks for their answers when it draws; nothing tells it that an answer changed. A change to a record's value redraws that record's cells by itself. Anything else a hook reads, such as a toggle, the user's role, other records or the result of a fetch, keeps its old answer on screen until you make the grid draw again:

| What the hook decides | When the grid asks | After a change, call |
|---|---|---|
| A cell's colours, loading, commands, control or parameters; a cell's lock and validation | Each time the cell draws | \`runtime.services.get('cells').render()\` for every cell on screen, or \`render()\` on one cell: \`cells.getCell(record, columnName)\`, or \`useGridCell()\` inside it |
| A record's lock | Each time the grid checks one of its cells; the dimmed row when one of the record's values changes or the provider reloads | \`cells.render()\`. The dimmed row follows on the record's next change or the next load. |
| A column's lock, a header's adornments or colours | Each time the header draws | \`runtime.services.get('columns').headers.render()\` |
| A column's menu | Each time the menu opens | Nothing |
| A row's height | When AG Grid lays the row out | \`resetRowHeights()\` on the \`gridApi\` service |
| The column definitions | When the grid is ready, then on every load of the provider | \`provider.refresh()\` |
| AG Grid options | When AG Grid is ready, on every load, and on \`refreshAgGridOptions()\` | \`runtime.refreshAgGridOptions()\` |
| AG Grid's initial options, the AG Grid theme, root styles | Once, when the grid mounts | A new \`key\` on \`<Grid.Root />\` |
| Surfaces | Each time \`<Grid.Root />\` renders | Nothing: a surface's component follows its own state |

\`cells.getCell\` finds only cells on screen. A cell that scrolls into view draws with the current answers anyway.
`

const meta = {
    title: 'Grid/Extending',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
