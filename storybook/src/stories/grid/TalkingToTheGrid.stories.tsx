import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DriveTheGridExample, GridLifeExample } from '../../grid/examples/talkingExamples'

const DESCRIPTION = `
Every mounted grid is an \`IGrid\`: one object your code talks to, to read the data, drive a module, change what the grid decides, or listen to what happens in it. Code outside the grid and a module inside it get the same one.

## Get the grid

Outside the grid, such as in a ribbon command, keep the grid \`onReady\` passes you once AG Grid is ready:

{{story: Drive the grid from the ribbon}}

Inside the grid, a module's \`onLoad\` receives it as the grid mounts, before AG Grid exists:

{{story: Follow a grid from mount to unmount}}

\`onDestroyed\` passes it once more as AG Grid is about to be destroyed. How to write a module is on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview).

| Member | Description |
|---|---|
| \`services\` | Every part of the grid, by key. See *Services* below. |
| \`modules\` | The modules the grid was given, by name. See *Modules* below. |
| \`events\` | \`onDataLoaded\` and \`onDestroyed\`. See *Events* below. |
| \`registerAgGridOptions\`, \`registerAgGridInitialOptions\`, \`refreshAgGridOptions\` | AG Grid's own options. See [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). |
| \`openRecord(params)\` | Opens a record as a double-click does: through \`onOpenRecord\` when the grid has one. |
| \`getLabels(set)\` | A set of labels as the grid resolves them. See [**Localization**](?path=/docs/concepts-localization--overview). |

## Services

The grid is made of services, and \`grid.services\` finds them by key:

| Member | Returns |
|---|---|
| \`get(key)\` | The service. Throws when nothing registered it, so use it for the services every grid has. |
| \`find(key)\` | The service, or \`undefined\`. Use it for \`gridApi\` before AG Grid is ready. |
| \`observe(key, callback)\` | Calls \`callback\` with the service now if there is one, and again each time something registers it. Returns the function that stops observing. |
| \`register(key, resolve)\` | Adds a service of your own, or replaces one. A module shares what it builds by returning it instead: see *Share what your module builds* on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview). |
| \`unregister(key)\` | Removes the service, until something registers it again. |

A function the \`observe\` callback returns is its cleanup. It runs before the callback runs again, when the service is unregistered, such as \`gridApi\` as AG Grid is destroyed, when you stop observing, and when the grid unmounts. Whatever the callback returns counts, so write it with braces unless you mean to return a cleanup, as the module above does.

Once the grid has unmounted, \`find\` returns \`undefined\`, \`get\` throws, and \`register\` and \`observe\` do nothing.

### In every grid

| Key | Description |
|---|---|
| \`provider\` | The provider the grid shows. |
| \`fields\` | A record's column: \`get(record, columnName)\` returns an \`IGridField\` with \`getValue()\`, \`getFormattedValue()\`, \`isValid()\` and \`setValue(value)\`, which saves as a cell would. |
| \`cells\` | The cells on screen: \`render()\`, \`getCells()\`, \`getCell(record, columnName)\`, and the cell hooks. |
| \`columns\` | The column definitions hook, and \`headers\`: \`render()\` and the header hooks. |
| \`rows\` | \`registerRowHeight\`, \`registerRowClass(className, rule)\` and \`refreshRowClasses(records)\`. |
| \`validation\` | The validation hook. |
| \`surfaces\` | The surface hook, for drawing inside the grid. |
| \`gridTheme\` | The AG Grid theme and the root element's styles: \`registerTheme\`, \`registerStyles\`. |
| \`state\` | The grid's store under its \`stateKey\`: \`get\`, \`set\`, \`delete\`. See [**State**](?path=/docs/controls-grid-state--overview). |
| \`settings\` | The props, with their defaults applied. |
| \`labels\` | The labels the grid mounted with: \`getLabels(set)\`. |
| \`viewport\` | The vertical scroll and the header: \`getScrollTop()\`, \`setScrollTop(top)\`, \`getScrollElement()\` and \`getHeaderHeight()\`, for something drawn beside the rows. |
| \`theme\`, \`pcfContext\` | The Fluent theme and the PCF context the grid mounted with. |
| \`keyboard\` | \`onKeyDown(handler)\` for every key pressed inside the grid, before AG Grid sees it; \`getKeyBeingPressed()\`. |
| \`grid\` | The \`IGrid\`, for a part that only has the services. |

What the hooks decide, and the order they run in, is on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview).

### Optional services

| Key | Registered | Description |
|---|---|---|
| \`gridApi\` | Once AG Grid is ready | AG Grid's \`GridApi\`. See [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). |

## Modules

\`grid.modules\` finds the modules the grid was given by name, with the same \`get\`, \`find\` and \`observe\`. A module reaches the ones before it in \`modules\` with \`get\` or \`find\`, and later ones with \`observe\`.

| Name | Given | Description |
|---|---|---|
| \`rowModel\` | In every grid | The row model; its \`type\` is \`'clientSide'\` or \`'serverSide'\`. |
| \`legacyClientApiCompatibility\` | With \`createLegacyClientApiCompatibilityModule()\` | See [**Legacy client API**](?path=/docs/controls-grid-modules-legacy-client-api--overview). |
| \`editing\` | With \`createEditingModule()\` | See *From your code* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). |
| \`rowSelection\` | With \`createRowSelectionModule()\` | See *From your code* on [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview). |
| \`sorting\`, \`filtering\` | With \`createSortingModule()\`, \`createFilteringModule()\` | See *From your code* on [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview). |
| \`grouping\`, \`aggregation\` | With \`createGroupingModule()\`, \`createAggregationModule()\` | See *From your code* on [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview). |
| \`cellSelection\`, \`clipboard\` | With \`createCellSelectionModule()\`, \`createClipboardModule()\` | See [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview). |
| Your own | With your module in \`modules\` | See [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview). |

## Inside what the grid draws

A custom cell, a header part, an overlay or a surface reads the grid through two hooks. Both work only inside the grid's own React tree, not in the component that renders \`<Grid />\`.

| Hook | Returns |
|---|---|
| \`useGridService(key)\` | The service. \`gridApi\` is \`undefined\` until AG Grid is ready, and the component renders again when it arrives. |
| \`useGridModule(name)\` | The module's instance. Throws when the grid was not given the module. |

They return the service, not its state. To redraw when it changes, subscribe to it, as the bar on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview) does.

## Events

\`addEventListener(event, callback)\` subscribes and returns the function that unsubscribes. Listeners on the grid's own emitters go with the grid; what to clean up is under *Clean up* on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview).

| Emitter | Event | Arguments | When it fires |
|---|---|---|---|
| \`grid.events\` | \`onDataLoaded\` | None | After every load of the provider, once the grid has its new columns and rows. When AG Grid is ready and the provider has already loaded, it fires once, just before \`onReady\`. |
| \`grid.events\` | \`onDestroyed\` | None | As the grid unmounts, after AG Grid is gone. |
| \`editing.events\` | \`onEditedCellChanged\` | \`previous?\`, \`next?\`, each \`{ recordId, columnName }\` | An editor opens or closes, or the user steps into or out of an in-place cell. |
| \`rowSelection.events\` | \`onSelectionChanged\` | \`selectedRecordIds\` | The selection changes. |
| \`filtering.events\` | \`onFilterOpened\` | \`columnName\` | A column's filter callout opens. |
| \`filtering.events\` | \`onFilterClosed\` | None | The filter callout closes. |

The grid's events also reach \`<Grid />\` as props, and a module's through its options: see [**Props and events**](?path=/docs/controls-grid-props-and-events--overview). No event fires when sorting, filters, grouping or totals change; they reload the provider, so follow \`onDataLoaded\` and read the provider. The provider has events of its own, such as \`onRecordColumnValueChanged\`: see *Events* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Redrawing

The grid runs the hooks and the column callbacks when it draws, and nothing tells it that their result changed. A change to a record's value redraws that record's cells by itself. When anything else a result depends on changes, such as a toggle, the user's role or other records, tell the grid to draw again:

| What changed | When the grid runs it | Call |
|---|---|---|
| A cell's colours, loading, commands, control, parameters, lock or validation | Each time the cell draws | \`grid.services.get('cells').render()\`, or \`render()\` on one cell from \`cells.getCell(record, columnName)\` |
| A record's lock | Each time one of its cells draws; the dimmed row when AG Grid updates the row | \`cells.render()\`, and \`rows.refreshRowClasses(records)\` for the dimmed row |
| A row class rule | When AG Grid updates the row | \`grid.services.get('rows').refreshRowClasses(records)\` |
| A column's lock, a header's adornments or colours | Each time the header draws | \`grid.services.get('columns').headers.render()\` |
| A column's menu | Each time it opens | Nothing |
| A row's height | When AG Grid lays the row out | \`resetRowHeights()\` on the \`gridApi\` service |
| The column definitions | When the grid is ready, then on every load | \`provider.refresh()\` |
| AG Grid options | When AG Grid is ready, on every load, and on \`refreshAgGridOptions()\` | \`grid.refreshAgGridOptions()\` |
| AG Grid's initial options, the AG Grid theme, root styles | Once, as the grid mounts | A new \`key\` on \`<Grid />\` |

\`cells.getCell\` finds only cells on screen; a cell that scrolls into view draws with the current results anyway.
`

const meta = {
    title: 'Controls/Grid/Talking to the grid',
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

export const DriveTheGridFromTheRibbon: Story = {
    name: 'Drive the grid from the ribbon',
    render: () => renderStory(<DriveTheGridExample />),
    parameters: {
        docs: {
            description: {
                story: `Timesheets grouped by status, with a ribbon that calls the grouping and sorting services through the grid from \`onReady\`, and a summary refreshed on \`grid.events\`' \`onDataLoaded\`. Try: expand all, then press *Most hours first* and watch the summary.`,
            },
        },
    },
}

export const FollowAGridFromMountToUnmount: Story = {
    name: 'Follow a grid from mount to unmount',
    render: () => renderStory(<GridLifeExample />),
    parameters: {
        docs: {
            description: {
                story: `A module that tints urgent tickets through the \`cells\` service and logs what the grid hands it: \`onLoad\`, the \`gridApi\` service with its cleanup, and \`onDestroyed\`. Try: click a cell, then press *Close and reopen* and read the log.`,
            },
        },
    },
}
