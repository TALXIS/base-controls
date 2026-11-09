import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { AssignFromTheRibbonExample, GridLifeExample } from '../../grid/examples/talkingExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'

const DESCRIPTION = `
Every mounted grid hands your code one object, an \`IGrid\`, through which it reads the data, drives the modules and follows what happens in the grid. Code outside the grid and a module inside it get the same object. Try it below: select two tickets and press *Assign to me*.

{{canvas: Assign tickets from the ribbon}}

## Get the grid

Outside the grid, such as in the ribbon above, keep the grid \`onSetup\` passes you, a new one on every mount; inside a DatasetControl, the control's \`parts.find('grid')\` returns it too (see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)). Inside the grid, a module's \`onLoad\` receives it, as on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview). When each runs is under *From mount to unmount* below.

| Member | Description |
|---|---|
| \`services\` | The grid's services, by key. See *Services* below. |
| \`modules\` | The modules the grid was given, by name. See *Modules* below. |
| \`events\` | \`onDataLoaded\`. See *Events* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview). |
| \`lifecycle\` | The mount's status and events, such as \`onReady\` and \`onDestroyed\`. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`hooks.agGridOptions\`, \`hooks.agGridInitialOptions\`, \`refreshAgGridOptions\` | AG Grid's own options. See [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). |
| \`hooks.openRecord\` | What opening a record does. See *Link to the record* on [**Columns**](?path=/docs/controls-grid-columns--overview). |
| \`openRecord(params)\` | Opens a record as a double-click does: through \`hooks.openRecord\`, then the provider. |
| \`getLabels(set)\` | A set of labels as the grid resolves them. See [**Localization**](?path=/docs/concepts-localization--overview). |

## From mount to unmount

{{block: lifecycle}}

{{story: Follow a grid from mount to unmount}}

## Services

The grid is made of services, and \`grid.services\` finds them by key; every key is under *Reference* below.

| Member | Returns |
|---|---|
| \`get(key)\` | The service. Throws when nothing provided it, so use it for the services every grid has. |
| \`find(key)\` | The service, or \`undefined\`. Use it for \`gridApi\` before AG Grid is ready. |
| \`has(key)\` | Whether the service is there. |
| \`observe(key, effect)\` | Calls \`effect\` with the service now if there is one, and again each time something provides it. Returns the function that stops observing. |
| \`provide(key, service, { onDestroy? })\` | Adds a service of your own, or replaces one, and returns the function that removes it; \`onDestroy\` releases it when it goes. A module shares what it builds by returning it instead: see *Share what your module builds* on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview). |

A function the \`observe\` effect returns is its cleanup. It runs before the effect runs again, when the service goes (\`gridApi\` as AG Grid is destroyed), when you stop observing and when the grid unmounts. Whatever the effect returns counts, so write it with braces unless you mean to return a cleanup. Once the grid has unmounted, \`find\` returns \`undefined\`, \`get\` throws, \`observe\` does nothing, and \`provide\` releases the service at once.

## Modules

\`grid.modules\` finds the modules the grid was given by name, with the same \`get\`, \`find\` and \`observe\`. A module reaches the ones before it in \`modules\` with \`get\` or \`find\`, and later ones with \`observe\`. Every name is under *Reference* below.

## Inside what the grid draws

A custom cell, a header part, an overlay or what a module draws inside the grid reads the grid through two hooks. Both work only inside the grid's own React tree, not in the component that renders \`<Grid />\`.

| Hook | Returns |
|---|---|
| \`useGridService(key)\` | The service. \`gridApi\` is \`undefined\` until AG Grid is ready, and the component renders again when it arrives. |
| \`useGridModule(name)\` | The module's instance. Throws when the grid was not given the module. |

They return the service, not its state. To redraw when it changes, subscribe to it, as the bar on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview) does.

## Events

\`addEventListener(event, callback)\` subscribes and returns the function that unsubscribes. Listeners on the grid's own emitters go with the grid; what to clean up is under *Clean up* on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview).

| Emitter | Event | Arguments | When it fires |
|---|---|---|---|
| \`grid.lifecycle.events\` | \`onReady\`, \`onInitFailed\`, \`onDestroyed\` | See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview) | The mount is ready, failed to load, or ends. |
| \`editing.events\` | \`onEditedCellChanged\` | \`previous?\`, \`next?\` | See *Options* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). |
| \`rowSelection.events\` | \`onSelectionChanged\` | \`selectedRecordIds\` | The selection changes. |
| \`filtering.events\` | \`onFilterOpened\` | \`columnName\` | A column's filter callout opens. |
| \`filtering.events\` | \`onFilterClosed\` | None | The filter callout closes. |

The events of the grid itself, its provider and its \`columns\`, \`rows\` and \`cells\` are under *Events* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview). No event fires when sorting, filters, grouping or totals change; they reload the provider, so follow \`onDataLoaded\` and read the provider, as the summary above the example's grid does.

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

## Reference

### Service keys

| Key | Description |
|---|---|
| \`provider\` | The provider the grid shows. |
| \`fields\` | \`get(record, columnName)\` returns an \`IGridField\` with \`getValue()\`, \`getFormattedValue()\`, \`isValid()\` and \`setValue(value)\`, which saves as a cell would. |
| \`cells\` | The cells on screen: \`render()\`, \`getCells()\`, \`getCell(record, columnName)\`, \`events\` and the cell hooks. |
| \`columns\` | The column definitions hook, \`events\`, and \`headers\`: \`render()\` and the header hooks. |
| \`rows\` | \`events\`, \`hooks.height\`, \`addRowClass(className, rule)\` and \`refreshRowClasses(records)\`. |
| \`validation\` | The validation hook. |
| \`surfaces\` | \`hooks.surfaces\`, for what a module draws inside the grid. See [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview). |
| \`gridTheme\` | The AG Grid theme and the root element's styles: \`hooks.theme\`, \`hooks.styles\`. |
| \`state\` | The grid's store under its \`stateKey\`: \`get\`, \`set\`, \`delete\`. See [**State**](?path=/docs/controls-grid-state--overview). |
| \`settings\` | The props, with their defaults applied. |
| \`labels\` | The labels the grid mounted with: \`getLabels(set)\`. |
| \`viewport\` | \`getScrollTop()\`, \`setScrollTop(top)\`, \`getScrollElement()\` and \`getHeaderHeight()\`, for something drawn beside the rows. |
| \`theme\`, \`pcfContext\` | The Fluent theme and the PCF context the grid mounted with. |
| \`keyboard\` | \`onKeyDown(handler)\` for every key pressed inside the grid, before AG Grid sees it; \`getKeyBeingPressed()\`. |
| \`grid\` | The \`IGrid\`, for code that only has the services. |
| \`gridApi\` | AG Grid's \`GridApi\`, only once AG Grid is ready. See [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). |

What the hooks decide, and the order they run in, is on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview).

### Modules by name

| Name | Given | Members |
|---|---|---|
| \`rowModel\` | In every grid | \`type\`: \`'clientSide'\` or \`'serverSide'\`. |
| \`editing\` | With \`createEditingModule()\` | See *Reference* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). |
| \`rowSelection\` | With \`createRowSelectionModule()\` | See *Reference* on [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview). |
| \`cellSelection\`, \`clipboard\` | With \`createCellSelectionModule()\`, \`createClipboardModule()\` | None. |
| \`sorting\`, \`filtering\` | With \`createSortingModule()\`, \`createFilteringModule()\` | See *Reference* on [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview). |
| \`grouping\`, \`aggregation\` | With \`createGroupingModule()\`, \`createAggregationModule()\` | See *Reference* on [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview). |
| \`legacyClientApiCompatibility\` | With \`createLegacyClientApiCompatibilityModule()\` | See *Reference* on [**Legacy client API**](?path=/docs/controls-grid-modules-legacy-client-api--overview). |
| \`license\` | With \`createLicenseModule({ key })\` | None: it only sets the key. See [**Modules**](?path=/docs/controls-grid-modules--overview). |
| Your own | With your module in \`modules\` | What its \`onLoad\` returns. See [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview). |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Change what the grid draws and decides, from a cell\'s colour to a lock.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-extending-write-a-module--overview', text: 'Package a feature of your own that gets the grid in onLoad.' },
    { title: 'Props and events', iconName: 'Settings', href: '?path=/docs/controls-grid-props-and-events--overview', text: 'Every prop of the grid, when it is read, and every event.' },
]

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The grid is set up', hook: 'onSetup', text: '`onSetup` gets each new `IGrid` before it loads, for code outside the grid to keep and subscribe to.' },
    { title: 'The modules load', hook: 'onLoad', text: 'Each module\'s `onLoad` gets the `IGrid`, in the order of `modules`, before AG Grid exists; a promise it returns is awaited. A module that throws shows the error inside the grid with *Try again*.' },
    { title: 'The grid loads', hook: 'onLoad', text: 'The `onLoad` prop is awaited, after the modules and before AG Grid renders.' },
    { title: 'The grid is ready', hook: 'onReady', text: '`grid.lifecycle.events` fires `onReady`, and AG Grid is created with the options the initial option hooks set.' },
    { title: 'AG Grid is ready', hook: "observe('gridApi')", text: 'The `gridApi` service is provided, so its observers run, and the grid draws the provider\'s data if it has loaded, firing `onDataLoaded`.' },
    { title: 'The provider loads', hook: 'onDataLoaded', text: 'After every load of the provider, the grid draws its new columns and rows and fires `onDataLoaded`.' },
    { title: 'The grid unmounts', hook: 'onDestroyed', text: '`grid.lifecycle.events` fires `onDestroyed`, then the `gridApi` service unregisters, so the cleanups its observers returned run while AG Grid still works.' },
    { title: 'The modules go', hook: 'onDestroy', text: 'Each module\'s `onDestroy` gets what its `onLoad` returned.' },
]

const meta = {
    title: 'Controls/Grid/Talking to the grid',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { lifecycle: () => <Lifecycle steps={LIFECYCLE} />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AssignTicketsFromTheRibbon: Story = {
    name: 'Assign tickets from the ribbon',
    render: () => renderStory(<AssignFromTheRibbonExample />),
}

export const FollowAGridFromMountToUnmount: Story = {
    name: 'Follow a grid from mount to unmount',
    render: () => renderStory(<GridLifeExample />),
    parameters: {
        docs: {
            description: {
                story: `A grid that logs each step from \`onSetup\` to its module's \`onDestroy\`. Try: close the grid, then open it again.`,
            },
        },
    },
}
