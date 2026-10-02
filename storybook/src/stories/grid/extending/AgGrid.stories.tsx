import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { JumpToNewestTicketExample, RearrangeColumnsExample } from '../../../grid/examples/agGridExamples'

const DESCRIPTION = `
The grid runs on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a> 31.3.2. For what no hook covers, a module can set AG Grid's options itself, and your code can call AG Grid's api once the grid is ready. Reach for them last: the grid sets many of AG Grid's options itself, and what you change through AG Grid's api is not written back to the provider.

## AG Grid's options

| Call | Its hooks run | For |
|---|---|---|
| \`runtime.registerAgGridInitialOptions(hook, priority?)\` | Once, when AG Grid is created | The options AG Grid reads only then, such as \`ensureDomOrder\`, \`suppressColumnVirtualisation\`, \`enableRtl\` or \`tooltipShowMode\` |
| \`runtime.registerAgGridOptions(hook, priority?)\` | When AG Grid is ready, after every load of the provider, and on every \`refreshAgGridOptions()\` | The options AG Grid takes at any time, such as \`headerHeight\`, \`suppressMovableColumns\` or \`tooltipShowDelay\` |
| \`runtime.refreshAgGridOptions()\` | | Runs the option hooks again and hands AG Grid the options whose value changed |

Each hook is handed \`{ options }\` and sets what it needs on it. Both register calls return a function that takes the hook off again, and their priorities work like every other hook's: see *Priorities* on [**Extending**](?path=/docs/grid-extending--overview).

\`\`\`tsx
import { IGridModule } from '@talxis/base-controls'

//screen readers read the rows in the order the page holds them
export const screenReaderModule: IGridModule = {
    onRegister: runtime => {
        runtime.registerAgGridInitialOptions(result => {
            result.options.ensureDomOrder = true
        })
    },
}
\`\`\`

- \`refreshAgGridOptions()\` compares each option with what AG Grid was last handed, by reference. A hook that builds a new object or function every time it runs hands it to AG Grid again on every refresh, so create functions and objects once, outside the hook, and read what changes inside them.
- \`refreshAgGridOptions()\` does not build the column definitions again. Column definitions hooks and \`colDefs\` run when the provider loads, so call \`provider.refresh()\` for those.
- Some options belong to the grid. Leave them alone, or the feature that sets them stops working:

| Options | Set by |
|---|---|
| \`rowModelType\`, \`getRowId\`, \`onGridReady\`, \`onGridPreDestroyed\`, \`rowHeight\`, \`initialState\`, \`reactiveCustomComponents\`, \`enableGroupEdit\`, \`loadingOverlayComponent\`, \`noRowsOverlayComponent\` | The grid, when AG Grid is created |
| \`columnDefs\` | The grid, from the column definitions hooks and \`colDefs\` |
| \`loadingCellRenderer\` | The grid, for rows whose records are still loading |
| \`getRowHeight\` | The \`rows\` service, from the row height hooks and \`rowSettings.onGetHeight\` |
| \`rowClassRules\` | The grid, for the muted rows of records locked as a whole |
| \`rowData\`, \`isGroupOpenByDefault\`, \`treeData\`, \`getDataPath\`, \`serverSideDatasource\`, \`isServerSideGroupOpenByDefault\` | The row model module |
| \`rowSelection\` | The row selection module |
| \`enableRangeSelection\` | The cell selection module |
| \`groupDisplayType\` | The grouping module |
| \`pinnedBottomRowData\`, \`isFullWidthRow\`, \`fullWidthCellRenderer\`, \`fullWidthCellRendererParams\` | The aggregation module, for the totals row |

The grid's other defaults are \`animateRows: false\`, \`suppressDragLeaveHidesColumns: true\`, \`enterNavigatesVertically: true\` and \`enterNavigatesVerticallyAfterEdit: true\`, and an option hook may change them.

{{story: Rearrange columns on request}}

## AG Grid's api

The \`gridApi\` service is AG Grid's \`GridApi<IRecord>\`, registered once AG Grid is ready:

| From | Reach it with |
|---|---|
| A module's \`onRegister\` | \`runtime.services.whenAvailable('gridApi', gridApi => ...)\`. \`find('gridApi')\` is still \`undefined\` there. |
| Code outside the grid, such as a toolbar | Keep the runtime that \`onGridReady\` hands you, and call \`runtime.services.find('gridApi')\` |
| A component the grid draws | \`useGridService('gridApi')\`, which can be \`undefined\` on the first render |

- Each row node's \`data\` is its \`IRecord\`, and its id is the record's id: \`gridApi.getRowNode(record.getRecordId())\`.
- What you change through the api stays in AG Grid. Widths you autosize are not written to the provider and fire no \`onColumnsChanged\`, and the grid lays the widths out again when its columns change or it switches between filling its width and scrolling. A value you write with \`node.setDataValue\` never reaches the record: use \`record.setValue\`.
- Set an option through a hook rather than \`gridApi.setGridOption\` when a hook also sets it: the hook's value replaces yours whenever it changes.
- Read what you want to keep from the api in \`onDestroyed\`, while it still answers: see [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview). Column widths and order are kept on the provider's columns instead: see *Remembering the layout* on [**Columns**](?path=/docs/grid-columns--overview).

{{story: Jump to the newest ticket}}

## AG Grid modules

\`agGridModules\` lists the AG Grid modules a module of yours needs, such as CSV export:

\`\`\`tsx
import { CsvExportModule } from '@ag-grid-community/csv-export'
import { IGridModule, IGridRuntime } from '@talxis/base-controls'

export const csvExportModule: IGridModule = {
    agGridModules: [CsvExportModule],
}

export const exportQueue = (runtime: IGridRuntime) => runtime.services.find('gridApi')?.exportDataAsCsv({ fileName: 'ticket-queue.csv' })
\`\`\`

- The grid registers them with AG Grid as it mounts, before AG Grid is created.
- They must be the same version as the grid's AG Grid: \`npm install @ag-grid-community/csv-export@31.3.2\`.
- AG Grid registers modules for the whole page: once one grid has registered a module, every grid on the page has it. AG Grid Enterprise modules need a licence: see [**Modules**](?path=/docs/grid-modules--overview).
- CSV export writes the values as the cells format them, such as an option's label.
`

const meta = {
    title: 'Grid/Extending/AG Grid',
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

export const RearrangeColumnsOnRequest: Story = {
    name: 'Rearrange columns on request',
    render: () => renderStory(<RearrangeColumnsExample />),
    parameters: {
        docs: {
            description: {
                story: `The shop's staff kept dragging columns out of place, so the layout stays locked until someone asks to rearrange it. An option hook sets AG Grid's \`suppressMovableColumns\` from a ref, and \`refreshAgGridOptions()\` hands AG Grid the new value when the switch flips. Turn on Rearrange columns and drag a header to a new place: \`onColumnsChanged\` lists the order the provider now holds. Turn it off, and the headers stay put.`,
            },
        },
    },
}

export const JumpToTheNewestTicket: Story = {
    name: 'Jump to the newest ticket',
    render: () => renderStory(<JumpToNewestTicketExample />),
    parameters: {
        docs: {
            description: {
                story: `The desk works its queue by Respond by, so a new ticket lands wherever its deadline puts it. The toolbar keeps the runtime from \`onGridReady\` and calls the \`gridApi\` service: \`autoSizeAllColumns()\` fits the columns to their content, and \`ensureNodeVisible()\` with \`flashCells()\` scrolls to the newest ticket and flashes its row. Press Jump to the newest ticket.`,
            },
        },
    },
}
