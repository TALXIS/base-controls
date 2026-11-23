import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
Every prop, member, part key, module parameter and slot of the DatasetControl, in one place to look up.

## DatasetControl props

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onLoad\` | \`(control) => IDatasetControlLoadResult \\| Promise<…>\` | Required | At mount | Returns the provider and the views, behind the placeholder, on every load. See *What onLoad returns* below. |
| \`children\` | \`ReactNode\` | Required | Live | The parts, laid out in the regions. See *Parts* below. |
| \`modules\` | \`IDatasetControlModule[]\` | None | At mount | The control's modules, such as user views, loaded on every load before \`onLoad\`. See *A module* below. |
| \`height\` | \`string\` | None | Live | A length, such as \`'600px'\`, sets the control's height; \`'100%'\` fills its parent, which needs a height of its own; left out, the control is as tall as what it holds. See [**Lay it out**](?path=/docs/controls-datasetcontrol-guide-features-lay-it-out--overview). |
| \`className\` | \`string\` | None | Live | Added to the control's box. |
| \`stateKey\` | \`string\` | None | At mount | Keeps the open view, and how the user left each view, under this key in the nearest state store. See [**Back where they left off**](?path=/docs/controls-datasetcontrol-guide-your-data-back-where-they-left-off--overview). |
| \`components\` | \`IDatasetControlComponents\` | Defaults | Live | See *Slots* below. |
| \`onSetup\` | \`(control: IDatasetControl) => void\` | None | At mount | Gets the control of each load, before its modules and \`onLoad\` run; subscribe to its events here. |
| \`onReady\` | \`(control: IDatasetControl) => void\` | None | At mount | Called once per load, when the control has loaded and its parts, the grid and the ribbon among them, are drawn. |

## What onLoad returns

| Key | Type | Default | Description |
|---|---|---|---|
| \`provider\` | \`IDataProvider\` | Required | The provider every part works on; a new one on every load. See [**Data providers**](?path=/docs/concepts-data-providers--overview). |
| \`views\` | \`IDatasetControlView[]\` | None | The views to switch between; the first one opens first. Without views, the provider's own columns show. See *A view* below. |
| \`destroyProviderOnUnmount\` | \`boolean\` | \`true\` | \`false\` keeps the provider when the control lets it go: on the next load, after a failed load and on unmount. Destroy it yourself, as *Lifetime* on [**Data providers**](?path=/docs/concepts-data-providers--overview) says. |

## A view

| Key | Type | Default | Description |
|---|---|---|---|
| \`id\` | \`string\` | Required | Unique among the control's views. |
| \`name\` | \`string\` | Required | Shown in the view switcher. |
| \`group\` | \`{ id, name }\` | None | The header the view is listed under; views without one are listed under *System views*. |
| \`resolve\` | \`(provider) => IDatasetControlViewDefinition \\| Promise<…>\` | Required | Called as the view opens. Sets the provider up for it, such as its filter or sorting, and returns what it shows. Set neither the columns nor the linking here, nor call \`addAggregation\` or \`addGroupBy\`: return them instead. |

A view filters and sorts only by columns it lists: list a column it filters or sorts by, with \`isHidden: true\` to keep it out of sight.

### What resolve returns

| Key | Type | Default | Description |
|---|---|---|---|
| \`columns\` | \`(Pick<IColumn, 'name'> & Partial<IColumn>)[]\` | Required | The columns the view shows: a \`name\`, plus any \`IColumn\` field to set, such as \`order\`, \`isHidden\`, \`aggregation\` for a total or \`grouping\`. The rest comes from the provider's available columns, and a column the provider does not offer is used as given when it has a \`dataType\`, or else left out. Columns show by their \`order\`, and those without one after them in the order listed. |
| \`linking\` | \`ILinkEntityExposedExpression[]\` | The provider's own | The related entities its columns come from, named \`alias.column\`. |
| \`data\` | \`TData\` | None | Anything else the view carries, read through \`getView().data\` and typed by the control's \`TData\`. |

## What starts a load

Every load mounts the control anew, with a new control, new modules and new parts; see [**Load the deals**](?path=/docs/controls-datasetcontrol-guide-basics-load-the-deals--overview).

| A load starts on | From your code | Asks about unsaved changes |
|---|---|---|
| The first mount | | No |
| Picking a view in the view switcher, or saving a new user view | \`control.loadView(viewId)\` | Yes |
| Saving *Edit columns*, or closing *Manage views* | \`control.reload()\` | Yes |
| **Try again** after a failed load | \`control.lifecycle.remount()\` | No |

## Failures

| What fails | What the user sees |
|---|---|
| A load: a module's \`onLoad\`, the control's \`onLoad\`, a view's \`resolve\` or the provider's first page | The error in place of the parts, with **Details** and **Try again**. See [**When loading fails**](?path=/docs/controls-datasetcontrol-guide-basics-when-loading-fails--overview). |
| A part, while it draws | The same error; **Try again** draws the parts again, without loading. |
| A later load of the provider, such as a search or another page | The error in \`DatasetControl.Notifications\`, until a load succeeds. See [**Messages and nothing to show**](?path=/docs/controls-datasetcontrol-guide-features-messages-and-nothing-to-show--overview). |
| The ribbon's first \`onLoad\` | The error in place of the commands, with **Details** and **Try again**. |
| A later \`onLoad\` of the ribbon, such as on a new selection | The error dialog; the commands before it stay. |
| Loading the columns *Edit columns* offers | The error in place of the pickers, with **Details** and **Try again**. |
| A ribbon command's \`onExecute\`, saving or deleting a user view, or your own \`control.execute(operation)\` | The error dialog, as on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |

## Parts

Each part is a member of \`DatasetControl\`, such as \`DatasetControl.QuickFind\`. Parts go inside the control, in any region, and keep the order you write them in. Every part, the regions included, takes \`components\`, live: its pieces and slots are under *Slots* below. \`QuickFind\`, \`EditColumns\`, \`Pagination\`, \`Notifications\` and \`UserQueries\` take nothing else; the others take these:

| Part | Prop | Type | Default | Timing | Description |
|---|---|---|---|---|---|
| \`Header\`, \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | \`children\` | \`ReactNode\` | None | Live | What the region holds: \`Start\` and \`End\` in \`Header\` and \`Footer\`, the parts in the others. |
| | \`className\` | \`string\` | None | Live | Added to the region's box. |
| \`ViewSwitcher\` | \`children\` | \`ReactNode\` | None | Live | What adds to the switcher, such as \`UserQueries\`, which draws the *Manage views* panel and throws without a user views module. |
| \`Ribbon\` | Every prop of [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview) | | | | Such as \`onLoad\` and \`disabled\`, but two: \`align\` follows the region, and \`control.parts\` takes the place of \`onSetup\`. |
| | \`onReady\` | \`(ribbon) => void\` | None | At mount | Called with the \`IRibbon\` each time the ribbon mounts, with every load of the control, once its commands are drawn. |
| | \`enableSave\` | \`boolean\` | \`true\` | Live | **Save**, while there are unsaved changes: saves every changed record. |
| | \`enableDiscard\` | \`boolean\` | \`true\` | Live | **Discard changes**, while there are unsaved changes: undoes them all. |
| | \`enableRefresh\` | \`boolean\` | \`true\` | Live | **Refresh**: loads the records again, asking about unsaved changes first. |
| \`PageSizeSwitcher\` | \`pageSizes\` | \`number[]\` | 25, 50, 75, 100 and 250 | At mount | The sizes the menu offers; the default is exported as \`DEFAULT_PAGE_SIZES\`. |
| \`EmptyState\` | \`children\` | \`ReactNode\` | None | Live | What shows the records while there are some, kept while the provider loads. |

\`Notifications\` draws the messages of the \`notifications\` part, which it provides: see *Notifications* below.

## The control

\`onLoad\`, \`onSetup\` and \`onReady\` get the \`IDatasetControl\` of the load; inside the control, \`useDatasetControl()\` returns it. Every load makes a new one: see [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview).

| Member | Description |
|---|---|
| \`loadView(viewId)\` | Mounts the control anew on the view, as picking it in the view switcher does. |
| \`reload()\` | Mounts the control anew on the view shown. |
| \`getViews()\` | The views of this load, from \`onLoad\` and the modules; empty before they have loaded. |
| \`getViewId()\`, \`getView()\` | The view shown, and the same view as it was resolved, with its columns and \`data\`. |
| \`getProvider()\` | The provider shown; \`undefined\` until the load succeeds. Inside the control, \`useDataProvider()\` returns it too. |
| \`parts\` | The parts drawn now, by key. See *Part keys* below. |
| \`viewSwitcher\`, \`ribbon\`, \`quickFind\`, \`pagination\`, \`pageSizeSwitcher\`, \`editColumns\` | The part of that key, as \`parts.get(key)\` returns it; throws while it is not drawn, so read it from \`onReady\` on. |
| \`notifications\` | The \`notifications\` part, as \`parts.get('notifications')\` returns it; throws while \`DatasetControl.Notifications\` is not drawn. |
| \`modules\` | The modules this load loaded, by name: \`get\`, \`find\`, \`has\` and \`observe\`, as for the parts. |
| \`surfaces.hooks.surfaces.add(hook, priority?)\` | Draws a dialog or panel of your own in the control: \`hook(surfaces)\` pushes \`{ key, onRender }\`, and \`onRender\` returns \`null\` while there is nothing to show. |
| \`lifecycle\` | The status, the error and the events of the load, and \`remount()\` for the view that failed. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`execute(operation, parameters?)\`, \`loading\`, \`executor\` | Runs an action of your own while a spinner covers the control, and opens the error dialog when it throws; \`loading.show(message?)\` covers the control for work of your own. See *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`getLabels(set)\` | A label set as the control's \`LabelsProvider\` gives it. See [**Localization**](?path=/docs/concepts-localization--overview). |
| \`getTheme()\` | The Fluent theme the control is drawn in. See [**Theming**](?path=/docs/concepts-theming--overview). |

### Events

| Event | On | Arguments | Fires when |
|---|---|---|---|
| \`onStatusChanged\` | \`control.lifecycle.events\` | \`status\` | The status changes; \`'failed'\` is a failed load, its error in \`lifecycle.getError()\`. |
| \`onRemountRequested\` | \`control.lifecycle.events\` | | The control is about to mount anew, through \`loadView\`, \`reload\` or \`lifecycle.remount\`. |
| \`onDestroyed\` | \`control.lifecycle.events\` | | The load's mount goes, before its modules and provider are destroyed. |
| \`onExecuteFailed\` | \`control.executor.events\` | \`error\`, \`title\` | A user view fails to save or delete, or \`control.execute\` fails. |
| \`onExecuteFailed\` | The ribbon's \`executor.events\` | \`error\`, \`title\` | A command, or a later \`onLoad\` of the ribbon, fails. |

### Part keys

Every part provides itself on the control under its key while it is drawn.

| Key | Part | Members |
|---|---|---|
| \`viewSwitcher\` | \`DatasetControl.ViewSwitcher\` | *View switcher* below |
| \`ribbon\` | \`DatasetControl.Ribbon\` | *From your code* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview) |
| \`quickFind\` | \`DatasetControl.QuickFind\` | *Quick find* below |
| \`editColumns\` | \`DatasetControl.EditColumns\` | *Edit columns* below |
| \`pageSizeSwitcher\` | \`DatasetControl.PageSizeSwitcher\` | *Page size switcher* below |
| \`pagination\` | \`DatasetControl.Pagination\` | *Pagination* below |
| \`notifications\` | \`DatasetControl.Notifications\` | *Messages* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview), and *Notifications* below |
| \`grid\` | The grid in the body | Grid's [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview) |

\`control.parts\` finds a part by its key with \`get\`, \`find\`, \`has\` and \`observe\`, as under *Parts* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). Declare a part of your own on \`IDatasetControlPartMap\` in \`declare module '@talxis/base-controls'\`, so its key is typed.

### A module

Pass modules in the control's \`modules\`. A module's \`onLoad\` gets the control with the members of *What a module's control adds* below.

| Member | Description |
|---|---|
| \`name\` | Unique within the control; two modules of one name fail the load. What \`onLoad\` returns is provided under it, for \`control.modules\` and \`useDatasetControlModule(name)\`. |
| \`priority\` | Optional, \`0\` by default. A lower one loads first, and modules of the same priority load at the same time. |
| \`onLoad(control, { signal })\` | Can be async. \`signal\` is aborted when the mount goes or another module fails. A throw fails the load, and the modules already loaded are destroyed. |
| \`onDestroy(instance)\` | Optional. Called as the mount goes, with what \`onLoad\` returned, the last loaded first, before the provider is released. |

Declare what \`onLoad\` returns on \`IDatasetControlModuleMap\` in \`declare module '@talxis/base-controls'\`, so \`control.modules.get(name)\` is typed.

### What a module's control adds

| Member | Description |
|---|---|
| \`hooks.views.add(hook, priority?)\` | Adds to or changes the views \`onLoad\` returned: \`hook(views)\` changes them in place, on every load. |
| \`getViewStateStore(viewId?)\` | Where the parts keep their state for a view, the open one unless \`viewId\` is given. |
| \`getHeight()\` | The control's \`height\` prop. |

Every \`add\` on this page returns its remover, and a higher \`priority\` runs later.

## Each part from your code

\`control.parts.get(key)\`, or the control's shortcut, such as \`control.quickFind\`, returns a part once it is drawn.

### View switcher

| Member | Description |
|---|---|
| \`getViews()\`, \`getView()\` | The views, and the open one as listed; \`undefined\` when it is not among them. |
| \`select(viewId)\` | Opens the view, as \`loadView\` does; nothing when it is already open. |
| \`hooks.items.add(hook, priority?)\` | Adds to the switcher's menu: \`hook(items)\` changes the Fluent \`IContextualMenuItem\`s in place each time the menu opens. |

### Quick find

| Member | Description |
|---|---|
| \`getQuery()\` | The query in the field, searched or not. |
| \`setQuery(query)\` | Puts the query in the field, without searching. |
| \`search()\` | Searches for the query, asking about unsaved changes first. |
| \`clear()\` | Empties the field, then searches again; if the user keeps unsaved changes, the field stays empty but the records do not change. |
| \`getColumns()\` | The columns a search matches on; empty when the provider cannot search. |
| \`isLikeQuery()\` | Whether the query starts with \`*\`, which searches slowly. |
| \`events\` | \`onQueryChanged\`, whenever the query is edited. |

### Edit columns

| Member | Description |
|---|---|
| \`open()\` | Opens the editor over the provider's columns. |
| \`close()\` | Closes the editor and drops what was not saved. |
| \`save()\` | Asks about unsaved changes, then writes the columns, clears the selection, closes the editor and mounts the control anew. |
| \`isOpen()\` | Whether the editor is open. |
| \`getSession()\` | The edit in progress, while the editor is open. See *The column editor's session* below. |
| \`events\` | \`onOpenChanged\`, whenever the editor opens or closes. |
| \`hooks.commands.add(hook, priority?)\` | Adds commands above the pickers: \`hook(commands, session)\` changes the \`ICommandBarItemProps\` in place. |
| \`hooks.columnCommands.add(hook, priority?)\` | Adds commands to each chosen column: \`hook(commands, column, session)\` changes them in place, Remove first. Give them \`onMouseUp\`, not \`onClick\`, since dragging swallows clicks. |

The pickers list what the provider's \`onGetAvailableColumns(options?)\` returns, a related entity's columns when \`options.entityName\` is given, and \`onGetAvailableRelatedColumns()\` adds the *Column source* picker; both are fetched anew each time the editor opens.

#### The column editor's session

| Member | Description |
|---|---|
| \`getColumns()\` | The visible chosen columns, in order; hidden ones are kept and saved as they are. |
| \`addColumn(column)\` | Adds the column first. |
| \`removeColumn(name)\` | Removes the column. |
| \`moveColumn(name, targetName)\` | Moves the column to where \`targetName\` is. |
| \`getAvailableColumns(query?)\` | Fetches the columns the column picker offers, filtered by \`query\`; empty when fetching fails. |
| \`getScopes(query?)\` | The entities the *Column source* picker offers: the records' own, then the related ones. |
| \`hasScopes()\` | Whether the provider offers related entities; \`false\` until they have loaded. |
| \`getMainScope()\` | The records' own entity, which the session starts in. |
| \`setScope(scope)\` | Sets which entity the columns being added come from. |
| \`getEntityDisplayName()\` | The records' collection name, from the provider's metadata. |
| \`refreshColumns()\` | Gives the chosen columns the provider's current definitions, keeping their place and width. |
| \`getError()\`, \`clearError()\` | What the last failed fetch threw, until cleared. |
| \`save()\` | Sets the columns on the provider and clears the selection, without loading; \`editColumns.save()\` calls it. |
| \`events\` | \`onColumnsChanged\`, \`onColumnAdded(column)\`, \`onScopeChanged\`, \`onScopesLoaded\` once related entities are known, and \`onLoadFailed\` when a fetch fails. |

### Page size switcher

| Member | Description |
|---|---|
| \`getPageSize()\`, \`getPageSizes()\` | The page size, and the sizes the menu offers. |
| \`setPageSize(size)\` | Loads the records in pages of that size, asking about unsaved changes first. |
| \`getRecordRange()\` | The range as the switcher shows it: \`{ first, last, total? }\`. \`last\` ends in \`+\` while there are more pages and no total, and \`total\` is \`'5000+'\` past the provider's count limit. |
| \`isLoading()\` | Whether the provider is loading. |
| \`events\` | \`onChanged\`, whenever the page size or the records on the page change. |

### Pagination

| Member | Description |
|---|---|
| \`getPageNumber()\` | The current page, counted from 1. |
| \`canMovePrevious()\`, \`canMoveNext()\` | Whether there is a page to move to, and nothing is loading. |
| \`moveFirst()\`, \`movePrevious()\`, \`moveNext()\` | Loads that page, asking about unsaved changes first. |
| \`events\` | \`onPagingChanged\`, whenever the page changes or starts loading. |

### Notifications

The \`notifications\` part holds every message the bar shows, yours and the control's, with \`add\`, \`remove\`, \`getMessages\` and \`events\`, as under *Messages* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). The control adds the provider's load error to it, escaped, under the \`id\` \`'provider-error'\`, and removes it once a load succeeds. Each load draws a new bar, so add a message of your own with \`control.parts.observe('notifications', …)\` from \`onSetup\`, as on [**Messages and nothing to show**](?path=/docs/controls-datasetcontrol-guide-features-messages-and-nothing-to-show--overview).

\`EmptyState\` has no part to reach: read \`provider.getRecords()\` instead.

## User views

A user views module adds **Save as new view**, **Save changes** and **Manage views** to the view switcher: see [**Views of their own**](?path=/docs/controls-datasetcontrol-guide-your-data-views-of-their-own--overview) and [**Where views are kept**](?path=/docs/controls-datasetcontrol-guide-your-data-where-views-are-kept--overview).

| Parameter | Type | Default | Description |
|---|---|---|---|
| **Every factory** | | | |
| \`enableSaveAsNewView\` | \`boolean\` | \`true\` | **Save as new view**. |
| \`enableSaveChanges\` | \`boolean\` | \`true\` | **Save changes**, while a user view is open. |
| \`enableManageViews\` | \`boolean\` | \`true\` | **Manage views**. |
| **\`createLocalStorageUserQueriesModule\`** | | | |
| \`storageKey\` | \`string\` | Required | The localStorage entry the views are kept in, in this browser; one per control. |
| **\`createTalxisUserQueriesModule\`, \`createDataverseUserQueriesModule\`** | | | |
| \`entityName\` | \`string\` | Required | The entity the views are of. |
| \`recordId\` | \`string\` | None | Only the views of this record; without it, only views of no record. Needs \`recordId\` mapped. |
| \`ownerId\` | \`string\` | None | Only the views this user owns; without it, every view the user can read. |
| **\`createDataverseUserQueriesModule\`** | | | |
| \`table\` | \`IDataverseUserQueriesTable\` | Required | The table's \`name\`, and its \`fieldMapping\`: the columns holding the view's \`name\`, \`layout\` and entity (\`returnedTypeCode\`), and optionally \`description\` and \`recordId\`. |
| **\`createUserQueriesModule\`** | | | |
| \`createStore\` | \`(control) => IUserQueriesStore\` | Required | Called on every load. See *A user views store* below. |

\`createTalxisUserQueriesModule\` is \`createDataverseUserQueriesModule\` with \`table\` set to TALXIS's \`talxis_userquery\`.

### The module from your code

\`control.modules.get('userQueries')\`, or \`useDatasetControlModule('userQueries')\` inside the control, returns it.

| Member | Description |
|---|---|
| \`saveWithView(key, getter, applier?)\` | Saves what \`getter\` returns with every user view, under \`key\`, and \`applier(value, provider)\` puts it back as a user view opens, before its first page. Declare the key on \`IUserQuerySavedValueMap\`. A getter that returns \`undefined\` saves nothing, and one that throws stops the save; a second call for the same key throws. Returns its remover. |
| \`getManageProvider()\` | The provider *Manage views* edits the views in, from the store's \`createManageProvider()\`. |
| \`deleteViews(viewIds)\` | Deletes the views through that provider; a failure opens the error dialog. |
| \`events\` | \`onManageRequested\`, when the user picks **Manage views**. |

### A user views store

| Member | Description |
|---|---|
| \`getViews()\` | The views to list, as \`{ id, name }\`. |
| \`getView(viewId)\` | The saved view: \`{ columns, linking, data }\`, each column with its \`name\`, \`isHidden\`, \`order\`, \`visualSizeFactor\`, \`grouping\` and \`aggregation\`. |
| \`createView(name, view)\` | Saves a new view and returns its id. The control then opens it. |
| \`updateView(viewId, view)\` | Saves the view again. |
| \`createManageProvider()\` | The provider *Manage views* edits the views in: one record per view, its id the primary id, with a \`name\` column. A rename reaches its \`onRecordSave\` and a delete its \`onRecordsDelete\`. |

\`LocalStorageUserQueriesStore\` and \`DataverseUserQueriesStore\` are exported, to extend.

## Inside your own parts

| React hook | Returns |
|---|---|
| \`useDataProviderEvents(events)\` | The provider, drawing the component again on each of the provider's \`events\`. |
| \`useDataProvider()\` | The provider, without drawing again. |
| \`useDatasetControl()\` | The control, to switch views or reach the parts. |
| \`useDatasetControlModule(name)\` | A module the control loaded, such as \`'userQueries'\`; throws when it is not loaded. |
| \`useControlStateStore(stateKey)\` | Where the component keeps what it should remember, per view. See [**State persistence**](?path=/docs/concepts-state-persistence--overview). |
| \`useDatasetControlRegion()\` | \`'start'\` or \`'end'\`, the side of the header or footer the component is in; \`undefined\` outside both. |
| \`useDatasetControlHeader()\` | Inside the header, \`showOnly()\` hides everything in it but the calling part, and \`showAll()\` brings the rest back; \`undefined\` outside the header. |
| \`useCompact()\` | Whether the header is compact. See [**Layout**](?path=/docs/concepts-layout--overview). |
| \`useProvidePart(control, key, create, parameters?)\` | The part \`create\` makes, once; it is provided on \`control\`, from \`useDatasetControl()\`, under \`key\` while the component is mounted. Declare the key on \`IDatasetControlPartMap\`. See *Parts* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |

\`DatasetControl.Ui\`, also exported as \`DatasetControlUi\`, holds the regions and most parts as plain UI with no control behind them: \`Container\`, \`Skeleton\`, the regions, \`ViewSwitcher\`, \`QuickFind\` with \`QuickFindCallout\` and \`QuickFindCompactButton\`, \`Pagination\`, \`PageSizeSwitcher\`, \`EmptyState\`, and the \`EditColumns…\` pieces. For the ribbon and the notifications, use the exported \`Ribbon\` and \`NotificationMessageBar\`.

## Slots

The control and every part take \`components\`: see [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview). *Top level* is the part's own slots. A default written \`…QuickFindComponents\` is exported as \`DatasetControlUiQuickFindComponents\`, \`…ManageViewsPanelComponents\` as \`UserQueriesUiManageViewsPanelComponents\`, and a blank one is not exported.

| Key | Slots | Default | Draws |
|---|---|---|---|
| **\`DatasetControl\`** | | | |
| \`container\` | \`onRender\` | \`…ContainerComponents\` | The control's box |
| \`skeleton\` | \`onRender\` | \`…SkeletonComponents\` | The placeholder while a load runs |
| \`mountError\` | \`onRender\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load |
| \`loadingOverlay\` | \`onRender\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingOverlayComponents\` | What covers the control while \`control.loading\` is shown, such as during \`control.execute\` |
| \`executeError\` | \`onRender\`, given \`failures\` and \`onDismiss(failure)\` | \`RuntimeExecuteErrorComponents\` | The error dialog for a failed user view or \`control.execute\` |
| **\`Header\`** | | | |
| Top level | \`onRender\` | \`…HeaderComponents\` | The header's box, a \`WrapCompactProvider\` |
| **\`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\`** | | | |
| Top level | \`onRender\` | \`…HeaderStartComponents\` and the like | The region's box |
| **\`ViewSwitcher\`** | | | |
| Top level | \`onRender\`, with the views as \`menuProps.items\` | \`…ViewSwitcherComponents\` | The button and its menu |
| **\`Ribbon\`** | | | |
| \`commandBar\` | \`onRender\`, with the commands as \`items\` | \`RibbonUiCommandBarComponents\` | The command bar |
| \`shimmer\` | \`onRender\` | \`RibbonUiShimmerComponents\` | The shimmer before the first load |
| \`mountError\` | As the control's \`mountError\` | \`ErrorMessageBarComponents\` | A failed first load |
| \`executeError\` | As the control's \`executeError\` | \`RuntimeExecuteErrorComponents\` | The error dialog for a failed command or later load |
| \`container\`, \`loadingOverlay\` | As on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview) | | The ribbon's box, and what covers it |
| **\`QuickFind\`** | | | |
| Top level | \`onRender\`, \`onRenderTextField\` | \`…QuickFindComponents\` | The box and the search field |
| \`compact\` | \`onRender\` | \`…QuickFindCompactButtonComponents\` | The search button in a compact header |
| \`callout\` | \`onRender\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` | \`…QuickFindCalloutComponents\` | The callout listing the columns searched |
| **\`EditColumns\`** | | | |
| \`button\` | \`onRender\`, \`onRenderButton\` | \`…EditColumnsButtonComponents\` | The button that opens the editor |
| \`panel\` | \`onRender\`, \`onRenderFooter\`, \`onRenderCommandBar\` | \`…EditColumnsPanelComponents\` | The editor's panel, its **Save** and **Cancel**, and the commands above the pickers, drawn only when there are some |
| \`scopeSelector\`, \`columnSelector\` | \`onRenderSelector\`, \`onRenderOption\` | \`…EditColumnsSelectorComponents\` | The *Column source* and column pickers |
| \`columnList\` | \`onRenderColumn\` | \`…EditColumnsColumnListComponents\` | Each chosen column, with its commands |
| \`errorMessage\` | As the control's \`mountError\` | \`ErrorMessageBarComponents\` | A failed load of the columns |
| **\`Notifications\`** | | | |
| Top level | \`onRenderMessageBar\`, \`onRenderMessage\`, \`onRenderToggleButton\`, \`onRenderMenu\` | \`NotificationMessageBarComponents\` | Each bar, a message's text, the summary's chevron and the messages it unfolds; see *Changing how it looks* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview) |
| **\`EmptyState\`** | | | |
| Top level | \`onRender\`, \`onRenderIcon\`, \`onRenderText\` | \`…EmptyStateComponents\` | The empty state |
| **\`Pagination\`** | | | |
| Top level | \`onRender\`, with the buttons as \`items\` | \`…PaginationComponents\` | The page buttons |
| **\`PageSizeSwitcher\`** | | | |
| Top level | \`onRender\`, with the sizes as \`menuProps.items\` | \`…PageSizeSwitcherComponents\` | The range and its menu |
| **\`UserQueries\`** | | | |
| \`manageViewsPanel\` | \`onRender\`, \`onRenderCloseButton\` | \`…ManageViewsPanelComponents\` | The *Manage views* panel |
| \`manageViews\` | \`datasetControl\`: the control's, plus the keys \`header\`, \`body\`, \`footer\`, \`ribbon\`, \`quickFind\` and \`pagination\`; \`grid\`: the \`Grid\`'s | | The control inside *Manage views*, and its grid |

To change the control's strings, see [**Localization**](?path=/docs/concepts-localization--overview).
`

const meta = {
    title: 'Controls/DatasetControl/Reference',
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
