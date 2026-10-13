import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DriveTheGridExample } from '../../grid/examples/talkingExamples'

const DESCRIPTION = `
Every mounted grid is an \`IGrid\`: one object your code talks to, to read the data, drive a module, change what the grid decides, or listen to what happens in it. Code outside the grid and a module inside it get the same one.

## Get the grid

Outside the grid, such as in a ribbon command, keep the grid \`onReady\` passes you once AG Grid is ready:

\`\`\`tsx
const gridRef = React.useRef<IGrid>()

const expandAll = () => {
    const grouping = gridRef.current?.services.find('grouping')
    grouping?.setExpandedLevel(grouping.getDeepestLevel())
}

<Grid modules={modules} onReady={grid => gridRef.current = grid} />
\`\`\`

{{story: Drive the grid from the ribbon}}

Inside the grid, a module's \`onRegister\` receives it as the grid mounts, before AG Grid exists:

\`\`\`tsx
const urgentTicketsModule: IGridModule = {
    onRegister: grid => {
        grid.services.get('cells').registerCellTheme((theme, { record }) => {
            if (record.getValue('priority') === HIGH) {
                theme.colors.text = '#a4262c'
            }
        })
    },
}

<Grid modules={{ rowModel: createClientSideRowModelModule(), custom: [urgentTicketsModule] }} />
\`\`\`

\`onDestroyed\` passes it once more as the grid unmounts, while AG Grid still works. How to write a module is on [**Write a module**](?path=/docs/grid-extending-write-a-module--overview).

| Member | Description |
|---|---|
| \`services\` | Every part of the grid, by key, the modules' included. See *Services* below. |
| \`events\` | \`onDataLoaded\` and \`onDestroyed\`. See *Events* below. |
| \`registerAgGridOptions\`, \`registerAgGridInitialOptions\`, \`refreshAgGridOptions\` | AG Grid's own options. See [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview). |
| \`openRecord(params)\` | Opens a record as a double-click does: through \`onOpenRecord\` when the grid has one. |

## Services

The grid is made of services, and \`grid.services\` finds them by key:

| Member | Returns |
|---|---|
| \`get(key)\` | The service. Throws when nothing registered it, so use it for the services every grid has. |
| \`find(key)\` | The service, or \`undefined\`. Use it for a module's service, which may be off, and for \`gridApi\` before AG Grid is ready. |
| \`whenAvailable(key, callback)\` | Calls \`callback\` with the service as soon as there is one: at once, or the moment something registers it. |
| \`register(key, resolve)\` | Adds a service of your own, or replaces one. See *Add a service of your own* on [**Write a module**](?path=/docs/grid-extending-write-a-module--overview). |

Once the grid has unmounted, \`find\` returns \`undefined\`, \`get\` throws, and \`register\` and \`whenAvailable\` do nothing.

### In every grid

| Key | Description |
|---|---|
| \`provider\` | The provider the grid shows. |
| \`fields\` | A record's column: \`get(record, columnName)\` returns an \`IGridField\` with \`getValue()\`, \`getFormattedValue()\`, \`isValid()\` and \`setValue(value)\`, which saves as a cell would. |
| \`cells\` | The cells on screen: \`render()\`, \`getCells()\`, \`getCell(record, columnName)\`, and the cell hooks. |
| \`columns\` | The column definitions hook, and \`headers\`: \`render()\` and the header hooks. |
| \`rows\` | The row height and row class hooks, and \`refreshRowClasses(records)\`. |
| \`validation\` | The validation hook. |
| \`surfaces\` | The surface hook, for drawing inside the grid. |
| \`gridTheme\` | The AG Grid theme and the root element's styles: \`registerTheme\`, \`registerStyles\`. |
| \`state\` | The grid's store under its \`stateKey\`: \`get\`, \`set\`, \`delete\`. See [**State**](?path=/docs/grid-state--overview). |
| \`settings\` | The props, with their defaults applied. |
| \`labels\` | The grid's strings: \`getLocalizedString(key)\`. |
| \`theme\`, \`pcfContext\` | The Fluent theme and the PCF context the grid mounted with. |
| \`keyboard\` | \`onKeyDown(handler)\` for every key pressed inside the grid, before AG Grid sees it; \`getKeyBeingPressed()\`. |
| \`rowModel\` | The row model; its \`type\` is \`'clientSide'\` or \`'serverSide'\`. |
| \`grid\` | The \`IGrid\`, for a part that only has the services. |

What the hooks decide, and the order they run in, is on [**Hooks**](?path=/docs/grid-extending-hooks--overview).

### Optional services

| Key | Registered | Description |
|---|---|---|
| \`gridApi\` | Once AG Grid is ready | AG Grid's \`GridApi\`. See [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview). |
| \`editing\` | With \`modules.editing\` | See *From your code* on [**Editing**](?path=/docs/grid-modules-editing--overview). |
| \`rowSelection\` | With \`modules.rowSelection\` | See *From your code* on [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview). |
| \`sorting\`, \`filtering\` | With \`modules.sorting\`, \`modules.filtering\` | See *From your code* on [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview). |
| \`grouping\`, \`aggregation\` | With \`modules.grouping\`, \`modules.aggregation\` | See *From your code* on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview). |
| Your own | With your module in \`modules.custom\` | See [**Write a module**](?path=/docs/grid-extending-write-a-module--overview). |

### Inside what the grid draws

A custom cell, a header part, an overlay or a surface reads a service with \`useGridService(key)\`:

- It works only inside the grid's own React tree; in the component that renders \`<Grid />\`, it throws.
- A service every grid has is there on the first render. An optional one is \`undefined\` until it is registered, and the component renders again when it arrives.
- It returns the service, not its state: to redraw when the service changes, subscribe to it, as the bar on [**Write a module**](?path=/docs/grid-extending-write-a-module--overview) does.

## Events

Subscribe with \`addEventListener(event, callback)\`, and stop with \`removeEventListener(event, callback)\` and the same function.

| Emitter | Event | Arguments | When it fires |
|---|---|---|---|
| \`grid.events\` | \`onDataLoaded\` | None | After every load of the provider, once the grid has its new columns and rows. When AG Grid is ready and the provider has already loaded, it fires once, just before \`onReady\`. |
| \`grid.events\` | \`onDestroyed\` | None | As the grid unmounts. Remove your provider listeners here. |
| \`editing.events\` | \`onEditedCellChanged\` | \`previous?\`, \`next?\`, each \`{ recordId, columnName }\` | An editor opens or closes, or the user steps into or out of an in-place cell. |
| \`rowSelection.events\` | \`onSelectionChanged\` | \`selectedRecordIds\` | The selection changes. |
| \`filtering.events\` | \`onFilterOpened\`, \`onFilterClosed\` | \`columnName\` | A column's filter callout opens or closes. |

- The grid's events also reach \`<Grid />\` as props, and a module's through its options: see [**Props and events**](?path=/docs/grid-props-and-events--overview).
- No event fires when sorting, filters, grouping or totals change. They reload the provider, so follow \`onDataLoaded\` and read the provider.
- The provider has events of its own, such as \`onRecordColumnValueChanged\` and \`onAfterRecordSaved\`: see *Events* on [**Data providers**](?path=/docs/data-providers--overview).

## Redrawing

The grid runs the hooks and the column callbacks when it draws, and nothing tells it that their result changed. A change to a record's value redraws that record's cells by itself. When anything else a result depends on changes, such as a toggle, the user's role or other records, tell the grid to draw again:

| What changed | When the grid runs it | Call |
|---|---|---|
| A cell's colours, loading, commands, control, parameters, lock or validation | Each time the cell draws | \`grid.services.get('cells').render()\`, or \`render()\` on one cell from \`cells.getCell(record, columnName)\` |
| A record's lock | Each time one of its cells draws; the dimmed row on the record's next change or the next load | \`cells.render()\` |
| A column's lock, a header's adornments or colours | Each time the header draws | \`grid.services.get('columns').headers.render()\` |
| A column's menu | Each time it opens | Nothing |
| A row's height | When AG Grid lays the row out | \`resetRowHeights()\` on the \`gridApi\` service |
| The column definitions | When the grid is ready, then on every load | \`provider.refresh()\` |
| AG Grid options | When AG Grid is ready, on every load, and on \`refreshAgGridOptions()\` | \`grid.refreshAgGridOptions()\` |
| AG Grid's initial options, the AG Grid theme, root styles | Once, as the grid mounts | A new \`key\` on \`<Grid />\` |

\`cells.getCell\` finds only cells on screen; a cell that scrolls into view draws with the current results anyway.
`

const meta = {
    title: 'Grid/Talking to the grid',
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
