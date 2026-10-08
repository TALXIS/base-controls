import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { JumpToNewestTicketExample, RearrangeColumnsExample } from '../../../grid/examples/agGridExamples'

const DESCRIPTION = `
The grid runs on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a> 36.2.0. For what no hook covers, a module can set AG Grid's options itself, and your code can call AG Grid's api once the grid is ready. Reach for them last: the grid sets many of AG Grid's options itself, and what you change through AG Grid's api is not written back to the provider.

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
- Some options belong to the grid or its modules. Leave these alone, or the feature that sets them stops working:
    - The rows and their ids: \`rowModelType\`, \`rowData\`, \`serverSideDatasource\`, \`getRowId\`, \`treeData\`, \`getDataPath\`.
    - The columns and their sizes: \`columnDefs\`, \`rowHeight\`, \`getRowHeight\`, \`domLayout\`. Use the column definitions hooks, \`colDefs\`, the row height hooks and the \`height\` prop.
    - What the modules switch on: \`rowSelection\`, \`cellSelection\`, \`readOnlyEdit\`, \`rowClassRules\`, \`pinnedBottomRowData\` and the full-width row options.
    - The overlays: \`activeOverlay\`, \`suppressOverlays\` and the overlay components. Use \`components.overlays\`: see [**Custom overlays**](?path=/docs/grid-appearance-custom-overlays--overview).
    - The look: \`theme\`. Use \`registerTheme\`: see *The AG Grid theme* on [**Appearance**](?path=/docs/grid-appearance--overview).
- The grid also sets \`animateRows: true\`, \`suppressDragLeaveHidesColumns: true\`, \`enterNavigatesVertically: true\` and \`enterNavigatesVerticallyAfterEdit: true\`. An option hook may change these.

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
- Read what you want to keep from the api in \`onDestroyed\`, while it still answers: see [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview). Column widths and order are kept on the provider's columns instead.

{{story: Jump to the newest ticket}}

## AG Grid modules

The grid registers only the AG Grid modules its own modules use. \`agGridModules\` lists the ones a module of yours needs, such as CSV export:

\`\`\`tsx
import { CsvExportModule } from 'ag-grid-community'
import { IGridModule, IGridRuntime } from '@talxis/base-controls'

export const csvExportModule: IGridModule = {
    agGridModules: [CsvExportModule],
}

export const exportQueue = (runtime: IGridRuntime) => runtime.services.find('gridApi')?.exportDataAsCsv({ fileName: 'ticket-queue.csv' })
\`\`\`

- The grid registers them with AG Grid as it mounts, before AG Grid is created.
- Import them from the grid's own \`ag-grid-community\` and \`ag-grid-enterprise\`, so they match its AG Grid version.
- AG Grid registers modules for the whole page: once one grid has registered a module, every grid on the page has it. An api call whose module no grid registered does nothing but log an AG Grid error.
- AG Grid Enterprise modules need a licence: see *AG Grid Enterprise and the licence* on [**Modules**](?path=/docs/grid-modules--overview).
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
                story: `The shop keeps its columns in place until someone asks to rearrange them. An option hook sets AG Grid's \`suppressMovableColumns\` from a ref, and \`refreshAgGridOptions()\` hands AG Grid the new value. Turn on *Rearrange columns* and drag a header: \`onColumnsChanged\` lists the order the provider now holds.`,
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
                story: `The queue is sorted by *Respond by*, so a new ticket lands wherever its deadline puts it. The toolbar keeps the runtime from \`onGridReady\` and calls the \`gridApi\` service: \`autoSizeAllColumns()\` fits the columns, and \`ensureNodeVisible()\` with \`flashCells()\` scrolls to the newest ticket and flashes it. \`flashCells\` needs AG Grid's \`HighlightChangesModule\`, so a module lists it in \`agGridModules\`. Press *Jump to the newest ticket*.`,
            },
        },
    },
}
