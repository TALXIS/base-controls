import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { docsOnlyStory } from '../../task-grid/docsOnlyStory'

const DESCRIPTION = `
Under \`<Grid.Root />\` is a **runtime**: the grid's services, and the hooks that change what they do. You reach it from a module of your own, from \`onGridReady\`, or with \`useGridService\` inside anything the grid draws.

\`\`\`tsx
const myModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellThemeHook((theme, { record, columnName }) => { /* ... */ })
    },
}

<Grid.Root provider={provider} modules={{ rowModel: createClientSideRowModelModule(), custom: [myModule] }} />
\`\`\`

## Services

| Service | What it is |
|---|---|
| \`provider\` | The data provider the grid was given. |
| \`columns\` | The column definitions, and \`columns.headers\` for the headers. |
| \`cells\` | What every cell draws. |
| \`rows\` | What is true of a row as a whole. |
| \`surfaces\` | What modules draw around the grid. |
| \`grid\` | The runtime itself. |
| \`gridApi\` | AG Grid's own api, once the grid is ready. See [**AG Grid**](?path=/story/grid-extending-ag-grid--overview). |
| \`rowSelection\`, \`sorting\`, \`filtering\`, \`grouping\`, \`aggregation\` | The modules of the same name, where the grid has them. |

\`services.get(name)\` returns a service and throws if there is none. \`services.find(name)\` returns \`undefined\` instead, for a module the grid may not have.

## Hooks

A hook is a function the grid calls with a result to change. Register it on its service; it returns a function that removes it.

| Hook | Service | What it changes |
|---|---|---|
| \`registerCellThemeHook\` | \`cells\` | A cell's colours |
| \`registerCellEditableHook\` | \`cells\` | Whether a cell can be edited |
| \`registerCellLoadingHook\` | \`cells\` | Whether a cell shows it is loading |
| \`registerCellCommandsHook\` | \`cells\` | The commands a cell offers |
| \`registerControlHook\` | \`cells\` | Which control draws a cell |
| \`registerControlParametersHook\` | \`cells\` | The parameters that control is given |
| \`registerRowHeightHook\` | \`rows\` | A row's height |
| \`registerColumnDefinitionsHook\` | \`columns\` | The column definitions AG Grid gets |
| \`registerColumnMenuSectionHook\` | \`columns.headers\` | The sections of a column's menu |
| \`registerColumnMenuItemsHook\` | \`columns.headers\` | The items of a column's menu |
| \`registerColumnHeaderAdornmentsHook\` | \`columns.headers\` | What a header draws beside its name |
| \`registerColumnHeaderThemeHook\` | \`columns.headers\` | A header's colours |
| \`registerSurfaceHook\` | \`surfaces\` | What is drawn around the grid |
| \`registerAgGridOptions\`, \`registerAgGridInitialOptions\` | the runtime | The options AG Grid gets. See [**AG Grid**](?path=/story/grid-extending-ag-grid--overview). |

Every hook takes a \`priority\`. Hooks run in ascending order, so a higher number has the last word. The built-in modules use \`GRID_MODULE_PRIORITY\`: to act after grouping, register with \`GRID_MODULE_PRIORITY.grouping + 1\`.

## Events

| Where | Events |
|---|---|
| \`runtime.events\` | \`onDataLoaded\`, \`onDestroyed\` |
| \`rows\` | \`onRowClicked\`, \`onActiveRowsChanged\` |
| \`cells.events\` | \`onFocusedCellChanged\` |
| \`columns.events\` | \`onCellDoubleClicked\`, \`onColumnsChanged\` |
| \`rowSelection.events\` | \`onSelectionChanged\` |

Subscribe with \`addEventListener\`. The grid's own events also reach \`<Grid.Root />\` as props, listed on [**Get started**](?path=/story/grid-get-started--overview).

## Where to go next

- [**Write a module**](?path=/story/grid-extending-write-a-module--overview): a module with a service and a surface of its own.
- [**Hooks**](?path=/story/grid-extending-hooks--overview): one example for each of the common hooks.
- [**AG Grid**](?path=/story/grid-extending-ag-grid--overview): AG Grid's options and api, for what no hook covers.
`

const meta = {
    title: 'Grid/Extending',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: { component: DESCRIPTION },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = docsOnlyStory
