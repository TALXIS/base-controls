import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
Every prop, event, module, hook, service key and slot of the Grid, in one place to look up.

## Grid props

\`ClientSideGrid\`, \`ServerSideGrid\` and \`Grid\` take the same props; \`ClientSideGrid\` and \`ServerSideGrid\` add their row model to \`modules\` (see [**Open groups on demand**](?path=/docs/controls-grid-guide-features-open-groups-on-demand--overview)). The grid draws the provider of the DatasetControl around it and takes none as a prop.

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`modules\` | \`IGridModule[]\` | None; required on \`Grid\` | At mount | The features, such as editing. \`Grid\` needs a row model among them. See *Modules* below. |
| \`enableNavigation\` | \`boolean\` | \`true\` | At mount | Draws lookups, emails, phones, URLs and the primary column as links, and opens a record on a double-click in a grid without the editing module. |
| \`enableOptionSetColors\` | \`boolean\` | \`false\` | At mount | Draws option set and two options values that have a colour as tags. |
| \`enableZebra\` | \`boolean\` | \`true\` | At mount | Shades every other row. |
| \`rowHeight\` | \`number\` | \`42\` | At mount | A row's height, in pixels. |
| \`maxVisibleRows\` | \`number\` | \`15\` | Live | How many rows a grid without a height grows to before it scrolls. |
| \`height\` | \`string\` | None | Live | The grid's height, as a CSS length; \`'100%'\` fills a parent that has a height. Without one the grid grows with its rows. Inside a DatasetControl with a \`height\`, the grid fills the control's body instead. See *Size the grid* on [**Colours and density**](?path=/docs/controls-grid-guide-make-it-yours-colours-and-density--overview). |
| \`className\` | \`string\` | None | Live | Added to the grid's root element. |
| \`components\` | \`IGridComponents\` | Defaults | Live | The overlays, and the loading and error rows. See *Slots* below. |
| \`stateKey\` | \`string\` | None | At mount | The key the grid keeps the scroll, the focused cell and the open groups under. See Grid's [**Back where they left off**](?path=/docs/controls-grid-guide-features-back-where-they-left-off--overview). |
| \`onSetup\` | \`(grid: IGrid) => void\` | None | At mount | Gets each new grid before it loads; add hooks and subscribe here. See [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview). |
| \`onReady\` | \`(grid: IGrid) => void\` | None | At mount | Called once per mount, when the modules have loaded and AG Grid is ready. |
| \`onLoad\` | \`(grid: IGrid) => void \\| Promise<void>\` | None | At mount | Awaited after the modules load and before AG Grid is drawn, on every mount. |

## Events

\`addEventListener(event, listener)\` subscribes and returns the function that removes the listener. \`columns\`, \`rows\` and \`cells\` are the grid's services of those keys, and \`editing\`, \`filtering\` and \`grouping\` its modules. When each fires in a mount is on [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview); what to remove when the grid goes is on Grid's [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview).

| Emitter | Event | Arguments | When it fires |
|---|---|---|---|
| \`grid.events\` | \`onDataLoaded\` | None | After every load of the provider, once the grid has its new columns and rows. |
| \`grid.lifecycle.events\` | \`onStatusChanged\` | \`status\` | The mount's status changes, such as to \`'ready'\` or \`'failed'\`. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| | \`onDestroyed\` | None | The grid unmounts. |
| The provider | \`onLoading\` | \`isLoading: boolean\` | The provider starts or stops loading. |
| | \`onRecordLoaded\` | \`record\` | A record loads, or loads again after it saved. |
| | \`onRecordColumnValueChanged\` | \`record\`, \`columnName\`, \`newValue\` | A value changes, edited by the user or set by \`record.setValue()\`. A save changes no value, so it does not fire for one. |
| | \`onRecordsSelected\` | \`selectedRecordIds\` | The selection changes. |
| | \`onBeforeRecordSaved\` | \`record\` | A record starts to save, before its values are checked. |
| | \`onAfterRecordSaved\` | \`result\` | Once for every record that saves: on auto-save, on \`record.save()\`, and for each record of \`provider.save()\`. A save refused for an invalid value fires it too, with \`success: false\` and the \`errors\`. |
| | \`onAfterSaved\` | \`results\` | Only after \`provider.save()\`, once every record in it has finished; auto-save never fires it. |
| | \`onError\` | \`message\`, \`details?\` | The provider reports an error, such as a failed load. |
| \`columns.events\` | \`onCellDoubleClicked\` | \`record\`, \`columnName\` | A double-click on a provider column's cell, group rows and the totals row included. |
| | \`onColumnsChanged\` | \`columns: IColumn[]\` | The user resized or moved a column, and the provider's columns are updated. |
| \`rows.events\` | \`onRowClicked\` | \`record\` | A click on a row, group rows and the totals row included. With row selection, a click on the checkbox, on a cell's commands or a plain click on a group row does not fire it. |
| | \`onHighlightedRowsChanged\` | None | The row the user hovers or focuses changes, or the selection does. |
| \`cells.events\` | \`onFocusedCellChanged\` | \`record?\`, \`columnName?\` | A cell takes the focus; both are \`undefined\` when the focus leaves the rows. |
| \`editing.events\` | \`onEditedCellChanged\` | \`previous?\`, \`next?\`, each with a \`recordId\` and a \`columnName\` | An editor opens or closes, or the user steps into or out of an in-place cell. |
| \`filtering.events\` | \`onFilterOpened\` | \`columnName\` | A column's filter callout opens. |
| | \`onFilterClosed\` | None | The callout closes, **Apply** included. No event says what was applied. |
| \`grouping.events\` | \`onGroupSelectionLimitDialogChanged\` | None | The alert for a refused selection opens or closes. |

No event fires when the sorting, a filter, the grouping or a total changes: each reloads the provider, so follow \`onDataLoaded\`. The provider's other events are under *Reference* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

## The grid

\`onSetup\`, \`onReady\` and \`onLoad\` on the grid, and a module's \`onLoad\`, get the \`IGrid\` of the mount; inside a DatasetControl, \`control.parts.find('grid')\` returns it too. Every mount makes a new one: see [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview).

| Member | Description |
|---|---|
| \`services\` | The grid's services, by key. See *Services* below. |
| \`modules\` | The modules the grid was given, by name: \`get\`, \`find\`, \`has\` and \`observe\`. In a module's \`onLoad\`, \`get\` and \`find\` reach only the modules of a lower \`priority\`. See *Modules* below. |
| \`events\` | \`onDataLoaded\`. See *Events* above. |
| \`hooks.openRecord\` | What opening a record does: a hook that sets \`request.isHandled\` opens it itself, and \`request\` also holds \`record\`, \`reference\` and \`columnName\`. When no hook handles it, the provider opens the record. See [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview). |
| \`openRecord({ record, reference, columnName? })\` | Opens a record as a click on its link does: through \`hooks.openRecord\`, then the provider. |
| \`hooks.agGridInitialOptions\`, \`hooks.agGridOptions\`, \`refreshAgGridOptions()\` | AG Grid's own options. See [**AG Grid**](?path=/docs/controls-grid-ag-grid--overview). |
| \`getLabels(set)\` | A label set as the grid resolves it. See [**Localization**](?path=/docs/concepts-localization--overview). |
| \`lifecycle\` | The mount's status, error and events, and \`remount()\`. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`loading\`, \`execute(operation, parameters?)\`, \`executor\` | Cover the grid with a spinner while your code works, and run an action whose failure is shown to the user. See *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`parts\`, \`notifications\` | Nothing on a grid: it draws no parts, so \`notifications\` throws. Show a message in the DatasetControl around the grid, as on [**Messages and nothing to show**](?path=/docs/controls-datasetcontrol-guide-features-messages-and-nothing-to-show--overview). |

### Services

\`grid.services\` finds the grid's services by key.

| Member | Returns |
|---|---|
| \`get(key)\` | The service. Throws when nothing provides it, so use it for the services every grid has. |
| \`find(key)\` | The service, or \`undefined\`, such as \`gridApi\` before AG Grid is ready. |
| \`has(key)\` | Whether the service is there. |
| \`observe(key, effect)\` | Calls \`effect\` with the service now if there is one, and again each time something provides it; returns the function that stops observing. A function \`effect\` returns is its cleanup: it runs before the effect runs again, when the service goes, when you stop observing and when the grid unmounts. |
| \`provide(key, service, { onDestroy? })\` | Adds a service of your own, or replaces one, and returns the function that removes it; \`onDestroy\` releases it when it goes. |

Once the grid has unmounted, \`find\` returns \`undefined\`, \`get\` throws, \`observe\` does nothing, and \`provide\` releases the service at once.

| Key | Holds |
|---|---|
| \`provider\` | The provider the grid shows. |
| \`fields\` | \`get(record, columnName)\` returns an \`IGridField\`: \`getValue()\`, \`getFormattedValue()\`, \`isValid()\`, \`getRecord()\`, \`getColumn()\`, and \`setValue(value)\`, which also saves the record while the editing module's \`enableAutoSave\` is on. |
| \`cells\` | The cells on screen: \`render({ columnNames? })\`, \`getCells()\`, \`getCell(record, columnName)\`, \`events\` and the cell hooks. |
| \`columns\` | The column definitions hook, \`events\`, and \`headers\`: \`render()\` and the header hooks. |
| \`rows\` | \`events\`, \`hooks.height\`, \`addRowClass(className, rule)\` and \`refreshRowClasses(records)\`. |
| \`validation\` | The validation hook. |
| \`surfaces\` | \`hooks.surfaces\`, for what a module draws inside the grid. See Grid's [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview). |
| \`gridTheme\` | The AG Grid theme and the root element's styles: \`hooks.theme\`, \`hooks.styles\`. See [**AG Grid**](?path=/docs/controls-grid-ag-grid--overview). |
| \`state\` | The grid's store under its \`stateKey\`: \`get\`, \`set\`, \`delete\`. |
| \`settings\` | The props, with their defaults applied. |
| \`labels\` | The labels the grid mounted with: \`getLabels(set)\`. |
| \`viewport\` | \`getScrollTop()\`, \`setScrollTop(top)\`, \`getScrollElement()\` and \`getHeaderHeight()\`, for something drawn beside the rows. |
| \`theme\`, \`pcfContext\` | The Fluent theme and the PCF context the grid mounted with. |
| \`keyboard\` | \`onKeyDown(handler)\` for every key pressed inside the grid, before AG Grid sees it, and \`getKeyBeingPressed()\`. |
| \`grid\` | The \`IGrid\`, for code that only has the services. |
| \`gridApi\` | AG Grid's \`GridApi\`, only once AG Grid is ready. See [**AG Grid**](?path=/docs/controls-grid-ag-grid--overview). |

### Inside what the grid draws

A cell, a header part, an overlay or what a module draws reads the grid through these React hooks. They work only inside the grid's own React tree, not in the component that renders the grid.

| React hook | Returns |
|---|---|
| \`useGridService(key)\` | The service. \`gridApi\` is \`undefined\` until AG Grid is ready, and the component draws again when it arrives. |
| \`useGridModule(name)\` | The module's instance. Throws when the grid was not given the module. |
| \`useGridServices()\` | \`grid.services\` itself, typed with your module's own service map when you pass one. |
| \`useGridCell()\` | Inside \`Grid.Cell.Root\`: the cell, with its record, column, context, theme, \`isLocked()\`, \`isLoading()\`, \`isBeingEdited()\` and \`render()\`. It draws again when the record changes. |
| \`useGridField()\` | Inside \`Grid.Cell.Field\`: the cell's field, as \`fields.get\` returns it; \`undefined\` outside one. |
| \`useGridColumnHeader()\` | Inside \`Grid.ColumnHeader.Root\`: the header. See *Hooks* below. |

They return the service, not its state: to draw again when it changes, subscribe to it.

## Columns

### Column keys

What the grid reads from each of the provider's columns, an \`IColumn\`.

| Key | Default | Description |
|---|---|---|
| \`name\` | Required | The column's id, its column definition's \`colId\`, and the record property that holds its value. |
| \`dataType\` | Required | How values are drawn and edited. See *Data types*. |
| \`displayName\` | Empty | The header's text. |
| \`visualSizeFactor\` | \`200\` | The width in pixels; columns share spare space by it. A resize is written back here. |
| \`order\` | The order you passed | The position, lowest first. A move is written back here. |
| \`isHidden\` | \`false\` | Leaves the column out of the grid. |
| \`isPrimary\` | \`false\` | Draws the value as a link that opens the record. |
| \`disableSorting\` | \`false\`; \`true\` for multi-select option sets, and for images in a \`FetchXmlDataProvider\` | Keeps the column out of sorting. |
| \`grouping\`, \`aggregation\` | None | Groups by the column, or totals it. See [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview). |
| \`metadata\` | Filled in by the provider | See *Metadata*. |

### Metadata

What a column allows. The provider fills in the keys you leave out.

| Key | Default | Description |
|---|---|---|
| \`IsValidForUpdate\` | \`true\`; \`false\` for files and images | \`false\` locks the column, with the editing module. |
| \`RequiredLevel\` | Not required | \`1\` or \`2\` makes an empty value invalid, and draws an asterisk in the header with the editing module. |
| \`MaxLength\` | No limit | Single-line text longer than this is invalid. |
| \`MinValue\`, \`MaxValue\` | No limit | A whole number or a decimal outside them is invalid; currency and durations are not checked against them. |
| \`SupportedFilterConditionOperators\` | Every operator of the data type | The operators the column's filter offers; \`[]\` turns filtering off. See *Filter operators*. |
| \`CanBeGrouped\` | \`true\`; \`false\` for files and images, and for dates in a \`FetchXmlDataProvider\` | Lets the column be grouped by; the grid never groups by a multi-select option set. |
| \`SupportedAggregations\` | \`countcolumn\`, \`count\`, \`min\`, \`max\`, \`sum\`, \`avg\` for numbers, currency, durations, languages and time zones; \`countcolumn\`, \`count\`, \`min\`, \`max\` for dates; none for files and images; \`countcolumn\`, \`count\` for the rest | The totals the column's menu offers. |
| \`OptionSet\` | No labels | The options, as \`{ Value, Label, Color }\`; two options need \`0\` and \`1\`. |
| \`Precision\` | The user's number format | Decimal places of a decimal or currency value. |

A value must also suit its data type: numbers, email addresses, URLs and dates are checked. What an invalid value and a refused save look like is on [**Check what users enter**](?path=/docs/controls-grid-guide-basics-check-what-users-enter--overview).

### Data types

How each type is shown, and how files and images read, is on [**Your first deal grid**](?path=/docs/controls-grid-guide-basics-your-first-deal-grid--overview). With the editing module, each is edited with:

| Data type | \`DataTypes\` | Edited with |
|---|---|---|
| Text, email, phone, URL | \`SingleLineText\`, \`SingleLineEmail\`, \`SingleLinePhone\`, \`SingleLineUrl\` | A text box |
| Text area, multiline text | \`SingleLineTextArea\`, \`Multiple\` | A multi-line text box |
| Whole number, decimal, currency | \`WholeNone\`, \`Decimal\`, \`Currency\` | A number box |
| Duration | \`WholeDuration\` | A duration box |
| Date only, date and time | \`DateAndTimeDateOnly\`, \`DateAndTimeDateAndTime\` | A date picker |
| Option set | \`OptionSet\` | A drop-down |
| Multi-select option set | \`MultiSelectOptionSet\` | A multi-select drop-down |
| Two options | \`TwoOptions\` | A toggle |
| Lookup | \`LookupSimple\`, \`LookupOwner\`, \`LookupCustomer\`, \`LookupRegarding\` | A Dataverse search; needs Xrm and a \`FetchXmlDataProvider\` |
| File, image | \`File\`, \`Image\` | Nothing: they never open an editor |
| Language, time zone | \`WholeLanguage\`, \`WholeTimeZone\` | A text box |

### Columns the modules add

| Constant | Column | Added by |
|---|---|---|
| \`RECORD_SAVE_COLUMN_KEY\` | The save status at the start of each row | Editing |
| \`RECORD_LOCK_COLUMN_KEY\` | The lock of a locked row, hidden until a row is locked | Editing |
| \`SELECTION_COLUMN_KEY\` | The checkboxes, pinned first; with editing, the save status is drawn here | Row selection |
| \`GROUP_EXPANSION_COLUMN_KEY\` | The narrow column whose header opens and closes a level of groups | Grouping |

A locked row also carries the class \`LOCKED_RECORD_ROW_CLASS\`.

### The column context

What the grid reads from a column definition's \`context\`; keys of your own sit beside these, and \`getColumnContext(colDef)\` reads them back. How to change a definition is on [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview).

| Key | Type | Description |
|---|---|---|
| \`isPrimary\` | \`boolean\` | Draws the value as a link to the record. |
| \`isRequired\` | \`boolean\` | Draws the required marker in the header; the editing module sets it from \`RequiredLevel\`. Validates nothing. |
| \`alignment\` | \`'left' \\| 'center' \\| 'right'\` | Which edge the value reads from; numbers and currency default to \`'right'\`. |
| \`widthOffset\` | \`number\` | Pixels added for what a module draws in the column, such as grouping's indent. Not saved. |
| \`cell.isRowResizable\` | \`boolean\` | Draws the grip a row is dragged taller by; on by default for text areas and multiline text. |
| \`cell.enableOneClickEdit\` | \`boolean\` | With the editing module, draws the column's editing control in the cell, so no editor opens. |

### Control parameters

A \`controlParameters\` hook on the \`cells\` service changes what a cell's control gets (see *Hooks*). Each parameter is an object with a \`raw\` value, such as \`{ raw: 'Not planned yet' }\`. A cell that only shows its value is drawn by \`GridValueRenderer\`, which reads these:

| Parameter | Description |
|---|---|
| \`Placeholder\` | The text an empty cell shows. Default \`---\`. |
| \`PrefixIcon\`, \`SuffixIcon\` | The name of a Fluent icon drawn before or after the value. |
| \`IsPrimaryColumn\` | \`true\`, with \`EnableNavigation\` also \`true\`, draws the value as a link that opens the record. |
| \`EnableNavigation\` | \`false\` draws emails, phones, URLs, lookups and the primary column as plain text. |
| \`EnableOptionSetColors\` | \`true\` draws options that have a colour as tags. |
| \`IsMultiline\` | \`true\` wraps the text onto the lines its row has room for, up to six. |
| \`ColumnAlignment\` | \`'left'\`, \`'center'\` or \`'right'\`. |

An editor, and a cell drawn with \`enableOneClickEdit\`, is drawn by the column's editing control, which takes that control's own parameters; the text field reads \`Placeholder\` too. \`GridValueRenderer\` reads the value from the record, so changing \`value\` here shows nothing.

## Keyboard

| Key | On a focused cell | While editing |
|---|---|---|
| F2, Backspace, or typing a character | With editing, opens the editor; on an in-place cell, steps into its control | Types |
| Enter | Moves down a row | Commits and moves down a row |
| Shift+Enter | Moves up a row | Commits and moves up a row |
| Esc | Nothing | Closes the editor and keeps what was typed; on an in-place cell, steps out |
| Space | With row selection, selects the row or takes it out | Types a space |
| Shift+arrow keys | With cell selection, extends the highlighted block from the focused cell | Moves in the text |
| Ctrl+C (Cmd+C on a Mac) | With the clipboard module, copies the highlighted blocks, or the focused cell | Copies the selected text |
| Ctrl+V, Ctrl+X | With the clipboard module in an editable grid, pastes into the focused cell or the highlighted block, or copies and clears it | Pastes or cuts text |
| Delete | In an editable grid, clears the focused cell, or every highlighted cell | Deletes text |

The clicks and drags that select rows and highlight cells are on [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview).

## Modules

Pass the modules you want in \`modules\`. Each is reached by its name with \`grid.modules\`, or \`useGridModule(name)\` inside what the grid draws. Modules marked *Enterprise* need an AG Grid Enterprise licence: see [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview).

| Factory | Name | Enterprise | Adds |
|---|---|---|---|
| \`createClientSideRowModelModule()\` | \`rowModel\` | No | Every row at once; \`ClientSideGrid\` loads it. Its member \`type\` is \`'clientSide'\`. |
| \`createServerSideRowModelModule()\` | \`rowModel\` | Yes | A group's rows fetched as it opens; \`ServerSideGrid\` loads it. Its member \`type\` is \`'serverSide'\`. See [**Open groups on demand**](?path=/docs/controls-grid-guide-features-open-groups-on-demand--overview). |
| \`createEditingModule(parameters?)\` | \`editing\` | No | Editing, the save status and locks. See *Editing* below. |
| \`createRowSelectionModule({ mode })\` | \`rowSelection\` | No | Checkboxes, and selecting rows. See *Row selection, cell selection and clipboard* below. |
| \`createCellSelectionModule(options?)\` | \`cellSelection\` | Yes | Highlighting blocks of cells. No members. |
| \`createClipboardModule(options?)\` | \`clipboard\` | Yes | Copying, and in an editable grid pasting. No members. |
| \`createSortingModule(parameters?)\` | \`sorting\` | No | Sorting from a column's menu. See *Sorting and filtering* below. |
| \`createFilteringModule(parameters?)\` | \`filtering\` | No | Filtering from a column's menu. See *Sorting and filtering* below. |
| \`createGroupingModule(parameters?)\` | \`grouping\` | Yes | Group rows. See *Grouping and totals* below. |
| \`createAggregationModule(parameters?)\` | \`aggregation\` | No | Totals in the group rows and in a row under the list. See *Grouping and totals* below. |
| \`createLegacyClientApiCompatibilityModule()\` | \`legacyClientApiCompatibility\` | No | What Power Apps client scripts set on records. See [**Legacy client API**](?path=/docs/controls-grid-legacy-client-api--overview). |
| \`createLicenseModule({ key })\` | \`license\` | No | Your AG Grid Enterprise key. See *Licence* below. |
| An \`IGridModule\` of your own | Its \`name\` | | What its \`onLoad\` returns. See Grid's [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview). |

Every module's parameters are read at mount. Which columns offer a feature comes from their keys and metadata: see *Columns*.

### Editing

| \`createEditingModule\` parameter | Type | Default | Description |
|---|---|---|---|
| \`enableAutoSave\` | \`boolean\` | \`false\` | Saves a record each time one of its values is committed; a paste saves each record once. |

| \`editing\` member | Description |
|---|---|
| \`isEditing(record, columnName)\` | Whether the user is editing that cell, in place or in an editor. |
| \`isBeingEdited(cell)\` | The same for an \`IGridCell\`, counting an editor from the moment it is drawn. |
| \`isEditorAvailable(record, colDef)\` | Whether an editor may open over the cell: the column is not in-place and the cell is not locked. |
| \`start(cell)\`, \`finish(cell)\` | Steps into an in-place cell; ends the edit and brings the focus back to the cell. |
| \`isAutoSaveEnabled()\` | Whether each commit saves its record. |
| \`locks.isColumnLocked(columnName)\`, \`isRowLocked(record)\`, \`isCellLocked(record, columnName)\` | Whether the column, the row or the cell is locked. |
| \`locks.getCellLockLevel(record, columnName)\` | \`'column'\`, \`'row'\` or \`'cell'\` for a locked cell, \`undefined\` for an open one. |
| \`locks.hooks.column\`, \`.row\`, \`.cell\` | Lock or open columns, rows and cells. See [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview). |
| \`events\` | \`onEditedCellChanged\`. See *Events*. |

### Row selection, cell selection and clipboard

| \`createRowSelectionModule\` parameter | Type | Default | Description |
|---|---|---|---|
| \`mode\` | \`'single' \\| 'multiple'\` | Required | How many rows may be selected at once. To offer no selection, leave the module out. |

| \`rowSelection\` member | Description |
|---|---|
| \`getMode()\` | \`'single'\` or \`'multiple'\`. |
| \`selectRecords(provider, ids)\` | Replaces that provider's selection with \`ids\`, through the hooks. In a grouped grid, each group's records have a provider of their own. |
| \`toggleRecord(record)\` | What a row's checkbox does: adds the record or takes it out, through the hooks. In \`'single'\` mode it replaces the selection. |
| \`hooks.selectRecords\`, \`hooks.selectionState\` | Refuse or change a selection, and how a checkbox reads. See *Hooks*. |
| \`getRecordSelectionState(node)\` | How a row's checkbox reads, after the selection state hooks. |
| \`isRecordSelectionDisabled(record)\` | Whether the record's checkbox is disabled, such as a group row in \`'single'\` mode. |
| \`isSelectionColumn(columnName)\` | Whether the column is the checkbox column. |

\`createCellSelectionModule()\` takes AG Grid's \`CellSelectionOptions\`:

| Option | Default | Description |
|---|---|---|
| \`suppressMultiRanges\` | \`false\` | \`true\` keeps one block at a time. |
| \`handle\` | None | \`{ mode: 'range' }\` draws a handle that resizes the block; \`{ mode: 'fill' }\` one that fills the cells it is dragged over in an editable grid: numbers continue their series, other values repeat. \`direction\` is \`'x'\`, \`'y'\` or \`'xy'\` (the default). |
| \`enableHeaderHighlight\` | \`false\` | \`true\` highlights the headers of the highlighted columns. |

\`createClipboardModule()\` takes AG Grid's clipboard options, \`IGridClipboardOptions\`:

| Option | Default | Description |
|---|---|---|
| \`copyHeadersToClipboard\` | \`false\` | \`true\` copies the column headers as the first line. |
| \`clipboardDelimiter\` | A tab | What goes between cells. |
| \`processCellForClipboard\` | None | What a cell copies as. \`params.value\` is the stored value, so \`params => params.value\` copies a value as the plain number. |
| \`processHeaderForClipboard\` | None | What a header copies as. |
| \`sendToClipboard\` | None | Receives the text to copy, in place of writing it to the clipboard. |
| \`suppressClipboardPaste\`, \`suppressCutToClipboard\` | \`false\` | \`true\` turns pasting, or cutting, off. |
| \`processCellFromClipboard\` | None | Changes each pasted text before the grid reads it. |

### Sorting and filtering

| Parameter | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`IGridSortingComponents\` for sorting, \`IGridFilteringComponents\` for filtering | \`{}\` | What the module draws. See *Slots*. |

| \`sorting\` member | Description |
|---|---|
| \`sortColumn(columnName, descending?, appendToExisting?)\` | Sorts by the column and reloads. \`appendToExisting: true\` adds a sort level, as Shift+click does. |
| \`clearColumnSorting(columnName)\` | Takes the column out of the sort and reloads. |
| \`isSorted(column)\`, \`isSortedDescending(column)\` | Whether the provider sorts by the column, and in which direction. |
| \`isColumnSortable(column)\` | Whether the column does not set \`disableSorting\`. It does not look at the column definitions. |
| \`getSortingLabel(columnName, descending?)\` | The text of the column's sort item, such as *Sort older to newer*. |
| \`getSorting()\` | The \`Sorting\` helper from \`@talxis/client-libraries\` the module writes the provider's sort through. |
| \`components\` | The \`components\` the module was given. |

| \`filtering\` member | Description |
|---|---|
| \`openFilter(columnName, target?)\` | Opens the column's callout, pointed at \`target\`. Pass the column's header element: without one the callout has nothing to point at. |
| \`closeFilter()\` | Closes the callout. |
| \`getOpenColumnName()\`, \`getOpenTarget()\` | The column whose callout is open, and the element it points at. |
| \`isColumnFilterable(column)\` | Whether \`SupportedFilterConditionOperators\` holds an operator. |
| \`isFiltered(column)\` | Whether a condition on the column is applied to the provider. |
| \`getColumnFilter(columnName)\` | The column's \`ColumnFilter\`, applied or not. |
| \`removeColumnFilter(columnName, saveToDataset?)\` | With \`saveToDataset: true\`, takes the column's condition out of the provider's filter and reloads, as **Clear** does. Without it, only a condition not yet applied is dropped. |
| \`getFiltering()\` | The \`Filtering\` helper from \`@talxis/client-libraries\` that holds every column's filter. |
| \`hooks.filterControlParameters\` | The parameters of the filter callout's controls. See *Hooks*. |
| \`getFilterControlParameters(parameters, { column, control, index })\` | The parameters a callout control gets: yours, the grid's defaults, then the hooks. |
| \`components\` | The \`components\` the module was given. |
| \`events\` | \`onFilterOpened\` and \`onFilterClosed\`. See *Events*. |

### Grouping and totals

| \`createGroupingModule\` parameter | Type | Default | Description |
|---|---|---|---|
| \`enableUserGrouping\` | \`boolean\` | \`true\` | Whether column menus offer **Group** and **Ungroup**. Preset grouping and \`toggleColumnGroup\` work either way. |
| \`type\` | \`'nested' \\| 'flat'\` | \`'nested'\` | \`'nested'\` makes each grouped column a level of its own; \`'flat'\` makes one level, a group for each combination of values. The provider regroups by it on its next load. |
| \`defaultExpandedLevel\` | \`number\` | \`-1\` | The deepest level that opens by itself, counting from \`0\`; \`-1\` keeps every group closed. |
| \`pinGroupedColumns\` | \`boolean\` | \`true\` | Pins grouped columns to the left. They move to the front either way. |
| \`maxGroupLoadsPerSelection\` | \`number\` | \`100\` | How many groups one selection may load the records of; a bigger selection is refused with an alert. |
| \`components\` | \`IGridGroupingComponents\` | \`{}\` | See *Slots*. |

| \`createAggregationModule\` parameter | Type | Default | Description |
|---|---|---|---|
| \`enableUserAggregation\` | \`boolean\` | \`true\` | Whether column menus have a *Totals* section. Preset totals show either way. |
| \`components\` | \`IGridAggregationComponents\` | \`{}\` | See *Slots*. |

| \`grouping\` member | Description |
|---|---|
| \`setExpandedLevel(level)\` | Opens the groups down to \`level\` and closes the rest; \`-1\` closes them all and \`getDeepestLevel()\` opens them all. |
| \`getExpandedLevel()\` | The level last applied, no deeper than \`getDeepestLevel()\`. Opening a single group does not change it. |
| \`getDeepestLevel()\` | One less than the number of grouped columns, \`0\` in flat mode, and \`-1\` while nothing is grouped. |
| \`toggleColumnGroup(columnName)\` | Groups by the column, or ungroups it, and reloads. |
| \`toggleGroup(node)\` | Opens or closes one group row. |
| \`isGroupRow(node)\` | Whether the AG Grid row node is a group row. |
| \`isRowGroupedBy(record, columnName)\` | Whether the record is a group row of that column. |
| \`isColumnExpandable(record, columnName)\` | Whether the group row's cell in that column carries the chevron. |
| \`isColumnGrouped(column)\`, \`canGroupColumn(column)\` | Whether the rows are grouped by the column, and whether its menu offers grouping. |
| \`getGroupedValueColumnName(record, columnName)\` | The alias a group row holds the column's value under. |
| \`getGroupedCount(record, columnName)\` | How many records a group row holds, while the grouped column's total is \`count\` or \`countcolumn\`. |
| \`getMaxGroupLoadsPerSelection()\` | The \`maxGroupLoadsPerSelection\` parameter. |
| \`isGroupSelectionLimitDialogOpen()\`, \`closeGroupSelectionLimitDialog()\` | Whether the alert for a refused selection is open, and closing it. |
| \`components\` | The \`components\` the module was given. |
| \`events\` | \`onGroupSelectionLimitDialogChanged\`. See *Events*. |

| \`aggregation\` member | Description |
|---|---|
| \`addAggregation(columnName, aggregationFunction)\` | Totals the column, replacing its total, and names the alias itself, unlike the provider's \`addAggregation({ columnName, alias, aggregationFunction })\`. |
| \`removeAggregation(alias)\` | Removes a total by its alias. |
| \`canAggregateColumn(column)\` | Whether the column's menu offers totals. |
| \`getTotalLabel(columnName)\` | What the column's total is called, such as *Sum*. |
| \`getAggregateValueColumnName(record, columnName)\` | The alias a group row or the totals row holds the column's total under. |
| \`components\` | The \`components\` the module was given. |

### Licence

| \`createLicenseModule\` parameter | Type | Default | Description |
|---|---|---|---|
| \`key\` | \`string\` | Required | Your AG Grid Enterprise key, as your host supplies it. One key licenses every grid on the page. |

## Filter operators

A column's filter offers the operators of its data type unless \`SupportedFilterConditionOperators\` lists others, each as the \`Value\` of an \`Operators\` entry.

| Data type | Operators |
|---|---|
| Text, email, phone, URL, text area, multiline, lookup, two options, option set | \`Equal\`, \`DoesNotEqual\`, \`Like\` (*Contains*), \`NotLike\`, \`BeginsWith\`, \`DoesNotBeginWith\`, \`EndsWith\`, \`DoesNotEndWith\`, \`ContainsData\`, \`DoesNotContainData\` |
| Whole number, duration, decimal, currency | \`Equal\`, \`DoesNotEqual\`, \`GreaterThan\`, \`GreaterThanOrEqual\`, \`LessThan\`, \`LessThanOrEqual\`, \`Between\`, \`NotBetween\`, \`ContainsData\`, \`DoesNotContainData\` |
| Date, date and time | \`On\`, \`OnOrAfter\`, \`OnOrBefore\`, \`Between\`, \`NotBetween\`, \`Today\`, \`Yesterday\`, \`Tomorrow\`, \`ThisWeek\`, \`ThisMonth\`, \`ThisYear\`, \`Next7Days\`, \`NextXDays\`, \`LastWeek\`, \`Last7Days\`, \`LastMonth\`, \`LastYear\`, \`LastXDays\`, \`LastXMonths\`, \`ContainsData\`, \`DoesNotContainData\` |
| Multi-select option set | \`Equal\`, \`DoesNotEqual\`, \`ContainValues\`, \`DoesNotContainValues\`, \`ContainsData\`, \`DoesNotContainData\` |
| File, image | \`ContainsData\`, \`DoesNotContainData\` |

An unfiltered column's callout opens on *Contains* for text, *On* for dates, *Contains data* for files and images, and *Equals* for the rest, so keep that operator in a list you narrow. On an option set or a two options column, *Equals* and *Does not equal* take several options and reach the provider as \`In\` and \`NotIn\`, so leave \`In\` and \`NotIn\` out of their lists.

Write a condition you set on the provider the way the callout does, or the callout opens with nothing picked:

| Value | Write it as |
|---|---|
| An option set value | A string, \`'4'\`; an array of them for \`In\` and \`NotIn\` |
| A date | \`'YYYY-MM-DD'\`; two of them for \`Between\` |
| *Contains* text | \`Like\` with \`'%invoice%'\` |
| An operator with no value, such as \`Today\` | \`''\` |

## Hooks

How \`add\` and \`priority\` work is on [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview); when hooks run, and how to make the grid draw again, on [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview). Each hook sits on \`hooks\` of what the *On* column names, such as \`cells.hooks.theme\`, and each \`add(hook, priority?)\` returns the function that removes the hook.

| Hook | On | Receives | Decides |
|---|---|---|---|
| \`theme\` | \`cells\` | \`builder\`, \`{ record, columnName }\` | A cell's colours. See [**Colours and density**](?path=/docs/controls-grid-guide-make-it-yours-colours-and-density--overview). |
| \`loading\` | \`cells\` | \`result\`, \`{ record, columnName }\` | \`result.isLoading\`: a shimmer in place of the value |
| \`commands\` | \`cells\` | \`result\`, \`{ record, columnName }\` | \`result.items\` and \`result.overflowItems\`, shown while the row is hovered, focused or selected |
| \`control\` | \`cells\` | \`result\`, \`{ record, columnName, takesInput }\` | \`result.control\`: the control that draws the cell, and its \`bindings\` |
| \`controlParameters\` | \`cells\` | \`parameters\`, \`{ record, columnName, takesInput }\` | The parameters the cell's control gets. See *Control parameters*. |
| \`height\` | \`rows\` | \`result\`, \`{ record, node }\` | \`result.height\` in pixels; unset for the grid's \`rowHeight\` |
| \`column\`, \`row\`, \`cell\` | \`editing.locks\` | \`result\`, \`{ columnName }\`, \`{ record }\` or \`{ record, columnName }\` | \`result.isLocked\` for a column, a row or a cell |
| \`validation\` | \`validation\` | \`result\`, \`{ record, columnName }\` | \`result.error\` and \`result.errorMessage\` |
| \`columnDefinitions\` | \`columns\` | \`columnDefs\` | The column definitions AG Grid gets. See [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview). |
| \`menuSections\` | \`columns.headers\` | \`sections\`, \`header\` | A menu's sections, each \`{ key, title, items }\` |
| \`menuItems\` | \`columns.headers\` | \`items\`, \`header\` | A menu's final items, each section's heading keyed \`'<section key>Header'\` |
| \`adornments\` | \`columns.headers\` | \`adornments\`, \`header\` | What a header draws beside the name, each with a \`key\`, a \`placement\` of \`'prefix'\` or \`'suffix'\`, and an optional \`title\` and \`onRender\` |
| \`theme\` | \`columns.headers\` | \`builder\`, \`header\` | A header's colours |
| \`surfaces\` | \`surfaces\` | \`surfaces\` | What modules draw inside the grid, each \`{ key, onRender }\` |
| \`filterControlParameters\` | \`filtering\` | \`result\`, \`{ column, control, index }\` | The parameters of the filter callout's \`'operator'\` and \`'value'\` controls; \`index\` is \`1\` for the second value of *Between* |
| \`selectRecords\` | \`rowSelection\` | \`selection\`, \`{ provider }\` | \`selection.recordIds\`, or \`selection.isCancelled\`; may be async |
| \`selectionState\` | \`rowSelection\` | \`result\`, \`{ node, record }\` | \`result.state\` of a row's checkbox: \`'checked'\`, \`'unchecked'\` or \`'indeterminate'\` |
| \`openRecord\` | The grid | \`request\` | \`request.isHandled\`: whether a hook opened the record in place of the provider |
| \`agGridOptions\`, \`agGridInitialOptions\` | The grid | \`result\` | AG Grid's options. See [**AG Grid**](?path=/docs/controls-grid-ag-grid--overview). |
| \`theme\`, \`styles\` | \`gridTheme\` | \`result\`, \`fluentTheme\` | The AG Grid theme and the root element's styles |

\`rows.addRowClass(className, rule)\` is not a hook and takes no priority: it puts a class on every row whose record the rule holds for, and returns the function that removes it.

### Module priorities

The built-in modules add their hooks at \`GRID_MODULE_PRIORITY\`; to run after module *x*, add at \`GRID_MODULE_PRIORITY.x + 1\`.

| Module | \`GRID_MODULE_PRIORITY\` |
|---|---|
| \`legacyClientApiCompatibility\` | \`-10\` |
| \`rowModel\` | \`10\` |
| \`editing\` | \`15\` |
| \`rowSelection\` | \`20\` |
| \`cellSelection\` | \`30\` |
| \`sorting\`, \`filtering\` | \`40\`, \`50\` |
| \`grouping\`, \`aggregation\` | \`60\`, \`70\` |
| \`clipboard\` | \`80\` |

### What the modules add

| Hook | Keys the modules add |
|---|---|
| \`menuSections\` | \`'sorting'\`, \`'filtering'\`, \`'grouping'\` and \`'aggregation'\` |
| \`adornments\` | After the name: \`'lock'\` (a locked column), \`'sort'\`, \`'filter'\` and \`'total'\`; before it: \`'grouping'\` |
| \`surfaces\` | \`'filterCallout'\`, \`'groupSelectionLimit'\` and \`'notificationCallout'\` (legacy client API) |

### A column header

Every header hook gets an \`IGridColumnHeader\`, which \`useGridColumnHeader()\` also returns:

| Member | Returns |
|---|---|
| \`getColumn()\`, \`getColDef()\` | The provider's column, \`undefined\` for a column you added, and its column definition |
| \`getName()\`, \`getTitle()\`, \`getContext()\`, \`getAlignment()\` | What the header shows: the name, the tooltip, the column context and the edge it reads from |
| \`isRequired()\`, \`getAdornments(placement?)\`, \`getMenuItems()\` | What it draws |
| \`getElement()\`, \`openMenu()\`, \`closeMenu()\` | Its element and its menu |

## Slots

How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

### The grid's own pieces

The grid's \`components\` prop. See [**Loading and nothing to show**](?path=/docs/controls-grid-guide-make-it-yours-loading-and-nothing-to-show--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`overlays.emptyState\` | \`onRender\`, \`onRenderIcon\`, \`onRenderText\` | \`DatasetControlUiEmptyStateComponents\` | The overlay of a grid with no rows |
| \`rows.loading\` | \`onRender\` | | A group's records while they load in a \`ServerSideGrid\` |
| \`rows.error\` | \`onRender\` | | Records or totals that failed to load, with the provider's error message |

### Cells

A column's cells take slots through \`cellRendererParams\` on its definition, and its editor through \`cellEditorParams\`: each takes \`components\`, and \`theme\`, a Fluent theme the cell's colours are made from. See [**Cells and headers of your own**](?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`columnControl\` | \`onRender(props, defaultRender)\` | \`CellColumnControlComponents\` | The value; in an editor, the input. The only slot handed a \`defaultRender\` |
| \`control\` | \`onRender\` | | The room the value is drawn in |
| \`container\` | \`onRender\` | | The whole cell |
| \`loading\` | \`onRender\` | | The shimmer while the cell waits |
| \`resizeGrip\` | \`onRender\`, \`onRenderGrip\` | | The grip a row is dragged taller by |
| \`commands\` | \`onRender\`, \`onRenderCommandBar\` | \`CellUiCommandsComponents\` | The cell's commands; not in an editor |
| \`fieldError\` | \`onRenderOutline\`, \`onRenderTooltip\`, \`onRenderIcon\` | | The validation outline and message; not in an editor. Keep the \`className\` \`onRenderOutline\` gets: the grid hides an invalid cell's focus border by it |
| \`lockIcon\` | \`onRender\`, \`onRenderIcon\` | | The lock of a locked cell, with the editing module; not in an editor |

To restyle only the value, render \`<GridValueRenderer {...props} components={…} />\` in \`columnControl.onRender\`. Its slots are \`onRender\`, \`onRenderText\`, \`onRenderPlaceholder\`, \`onRenderLink\`, \`onRenderLookup\`, \`onRenderOptions\`, \`onRenderFile\`, \`onRenderPrefixIcon\` and \`onRenderSuffixIcon\`, with defaults in \`CellUiValueRendererComponents\`.

A \`cellRenderer\` of your own is composed from \`Grid.Cell\`'s parts, nested in the order of the table; your cell keeps only the parts you include. An editor of your own renders \`EditingCell.Editor\`.

| Part | Brings |
|---|---|
| \`Field\` | Binds the cell to a record's column, for \`useGridField()\`. Leave it out for a column of your own |
| \`Root\` | Makes it a cell, drawn again when the record changes. Required; in an editor, pass \`takesInput\` |
| \`Theme\` | The cell's colours: zebra rows and the theme hooks |
| \`ResizeGrip\` | The grip a row is dragged taller by |
| \`Container\` | The theme's font and text colour across the cell |
| \`Loading\` | The shimmer while the cell waits, in place of what it wraps |
| \`LockIcon\` | The lock of a locked cell, with the editing module; inside \`Loading\`, before \`Control\` |
| \`Control\` | The room the value is drawn in; the commands, error icon and lock keep to its edge |
| \`ColumnControl\` | The value: \`GridValueRenderer\`, a PCF control the column names, or your \`columnControl.onRender\`; inside \`Control\` |
| \`Commands\` | The cell's commands, while the row is hovered, focused or selected |
| \`FieldError\` | The validation outline and its message |

\`Grid.Cell.Renderer\` is the grid's own cell, built from these parts, and \`Grid.Cell.EmptyRenderer\` an empty one.

### Headers

A column's header takes slots through \`headerComponentParams\` on its definition: \`components\`, and \`theme\`, a Fluent theme the header's colours are made from.

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`container\` | \`onRender\` | | The button the header is, which opens the menu |
| \`prefix\`, \`suffix\` | \`onRender\` | | The adornments before and after the name |
| \`content\` | \`onRender\` | | What holds the name and the required marker |
| \`label\` | \`onRender\` | | The column's name |
| \`requiredMarker\` | \`onRender\` | | The \`*\` of a required column |
| \`menu\` | \`onRender\` | | The column's menu |

A \`headerComponent\` of your own gets AG Grid's header params, \`IColumnHeaderRendererProps\`, and is composed from \`Grid.ColumnHeader\`'s parts; \`Grid.ColumnHeader.Renderer\` is the grid's own header.

| Part | Brings |
|---|---|
| \`Root\` | Makes it a column's header, for \`useGridColumnHeader()\`. Required, and outermost |
| \`Theme\` | The header's colours, from the header theme hooks |
| \`Container\` | The button the header is: hover, focus, alignment, and a click that opens the menu |
| \`Prefix\` | The adornments before the name |
| \`Content\` | What holds the name and the required marker |
| \`Label\` | The column's name |
| \`RequiredMarker\` | The \`*\` of a required column |
| \`Suffix\` | The adornments after the name, such as the sort arrow, the funnel and the lock |
| \`Menu\` | The column's menu; beside \`Container\`, not inside it |

### The modules' pieces

Sorting, filtering, grouping and aggregation take \`components\` in their parameters. The editing and row selection modules draw columns of their own: restyle them from a column definitions hook at \`GRID_MODULE_PRIORITY.clipboard + 1\`, through \`cellRendererParams\` and \`headerComponentParams\` on the columns under *Columns the modules add*.

**Editing**, in the save status and lock columns:

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`container\` | \`onRender\` | | The save status column's cell |
| \`indicator\` | \`onRender\`, \`onRenderSpinner\`, \`onRenderButton\` (with \`state\`), \`onRenderErrorCallout\` | \`RecordSaveUiIndicatorComponents\` | The spinner, check or error icon |
| \`errorCallout\` | \`onRender\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\`, \`onRenderFieldName\`, \`onRenderMessage\`, \`onRenderFooter\`, \`onRenderDismissButton\` | \`RecordSaveUiErrorCalloutComponents\` | Why a save was refused |
| \`container\`, \`lockIcon\` (lock column) | \`onRender\`; \`onRender\`, \`onRenderIcon\` | | The lock column's cell, and the lock of a locked row |

**Row selection**, in the checkbox column:

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`container\` | \`onRender\` | | The checkbox column's cell; with editing, it takes the save status keys too |
| \`checkbox\` | \`onRender\`, \`onRenderCheckbox\` | \`RowSelectionUiCheckboxComponents\` | A row's checkbox. The container takes the click, so keep its \`onClick\` |
| \`headerCheckbox\` (header) | \`onRender\`, \`onRenderCheckbox\` | \`RowSelectionUiHeaderCheckboxComponents\` | The checkbox that selects every row |

**Sorting**, in its \`components\` parameter:

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`sortIcon\` | \`onRenderIcon\` (with \`descending\`) | \`GridSortingIconComponents\` | The arrow of a sorted column |

**Filtering**, in its \`components\` parameter:

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`filterIcon\` | \`onRenderIcon\` | \`GridFilteringIconComponents\` | The funnel of a filtered column |
| \`filterCallout\` | \`onRender\`, \`onRenderHeader\`, \`onRenderTitle\`, \`onRenderCloseButton\` | \`FilteringUiCalloutComponents\` | The frame of the filter callout; what it holds has no slots |

**Grouping**, in its \`components\` parameter:

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`groupingIcon\` | \`onRenderIcon\` | \`GridGroupingIconComponents\` | The icon of a grouped column |
| \`groupCell.toggle\` | \`onRender\`, \`onRenderButton\` (with \`isExpanded\`) | \`GroupingUiToggleComponents\` | The chevron of a group |
| \`groupCell.count\` | \`onRender\` | \`GroupingUiCountComponents\` | How many records the group holds |
| \`groupCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | | The rest of a group's cell |
| \`expandCollapse\` (expansion column header) | \`onRender\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\` | \`GroupingUiExpandCollapseComponents\` | The + and − that open and close a level |

**Aggregation**, in its \`components\` parameter:

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`totalCell.totalValue\` | \`onRender\`, \`onRenderLabel\`, \`onRenderValue\` | \`AggregationUiTotalValueComponents\` | A total and its label in the totals row |
| \`totalCell.container\`, \`loading\`, \`commands\` | As in any cell | | The rest of a total's cell |
| \`aggregateCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | | A total in a group row |

The expansion column's header takes \`expandCollapse\` through \`headerComponentParams\` on \`GROUP_EXPANSION_COLUMN_KEY\`. To change one column's arrow, funnel, lock or grouping icon, replace its adornment (see *What the modules add*) in an \`adornments\` hook after the module. The alert for a refused group selection is the host's own dialog and has no slots.

To change the grid's strings, see [**Localization**](?path=/docs/concepts-localization--overview).
`

const meta = {
    title: 'Controls/Grid/Reference',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

//a docs page needs a story, and this one has nothing to show
export const Overview: Story = {
    name: 'Overview',
    tags: ['!dev'],
    render: () => <></>,
}
