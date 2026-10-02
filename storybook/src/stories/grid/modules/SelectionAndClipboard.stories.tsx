import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ApproveInBulkExample, CopyPriceListExample, PickOneProductExample } from '../../../grid/examples/selectionExamples'

const DESCRIPTION = `
Let people pick the rows they want to act on, highlight blocks of cells, and copy what they highlighted into a spreadsheet. Row selection works with AG Grid Community; cell selection and copying need AG Grid Enterprise (see [**Modules**](?path=/docs/grid-modules--overview)).

{{story: Approve timesheets in bulk}}

## Row selection

\`\`\`tsx
rowSelection: createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelectedIds }),
\`\`\`

The module adds a checkbox column, pinned first. Its options:

| \`createRowSelectionModule\` | Default | What it does |
|---|---|---|
| \`mode\` | required | \`'multiple'\` lets any number of rows be selected, \`'single'\` one at a time. To offer no selection, leave the module out. |
| \`onSelectionChanged\` | | Called with the ids of the selected records every time the selection changes. |
| \`components\` | | Your own row checkbox, header checkbox and save status: see [**Custom Components**](?path=/docs/grid-appearance-custom-components--overview). |

The options are read once, when the grid mounts, so the \`onSelectionChanged\` the grid mounted with runs for its whole life. Pass a state setter, as the examples here do, or read anything that changes through a ref.

### How people select

| Action | What it does |
|---|---|
| Click a row | Selects that row and clears the others, in both modes |
| Ctrl+click (Cmd+click on a Mac) | Adds the row to the selection, or takes it out |
| Shift+click | Selects every row from the last one selected to this one |
| Space | Selects the focused row, or takes it out |
| A row's checkbox | Adds the row, or takes it out, and leaves the others as they are |
| The header checkbox | Selects every row on the current page, or every group while the rows are grouped; unticking it clears the selection |

- In \`'single'\` mode every click and every checkbox replaces the selection, and there is no header checkbox.
- Clicking a cell to edit it is a click on its row: it selects the row and clears the others.
- A click on a cell's commands does not select the row, and in the checkbox column only the checkbox does.
- In a grouped grid, a plain click on a group row does not select it; Ctrl+click or the group's checkbox selects every record in the group. In \`'single'\` mode a group row's checkbox is disabled. How many groups one selection may load is on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

{{story: Pick one product}}

### Reading and changing the selection

The selection belongs to the provider, not to the grid. Read it and change it there, and the grid follows:

| Provider method | What it does |
|---|---|
| \`getSelectedRecordIds()\` | The selected records' ids, without group rows. Pass \`{ includeGroupRecordIds: true }\` to include them. |
| \`setSelectedRecordIds(ids)\` | Replaces the selection. The id of a group row selects every record in the group. |
| \`toggleSelectedRecordId(id)\` | Adds the id to the selection, or takes it out. |
| \`clearSelectedRecordIds()\` | Clears the selection. |

To get from an id to its record, use \`provider.getRecordsMap()[id]\`, which also holds the records of the groups that were loaded.

- **A reload clears the selection.** Sorting, filtering, grouping, \`refresh()\` and moving to another page all start with nothing selected, and \`onSelectionChanged([])\` is called.
- **The selection outlives the grid.** A grid that mounts over a provider that already has a selection, for example after a \`key\` change, shows those rows selected and scrolls to them.
- \`onSelectionChanged\` is called a moment after the change, not during the click, and for every change: a click, the header checkbox, your own \`setSelectedRecordIds\` and \`clearSelectedRecordIds\`, a reload clearing it, and a new mount restoring it. Its ids are records only: group rows are left out, and the records of a selected group are in.

### The save status in the checkbox cell

With row selection on, a row's save status is drawn in its checkbox cell, in place of the checkbox while there is one, so an editable grid has no save status column of its own. After a failed save the checkbox stays hidden until the red icon is dismissed. What the status shows is on [**Editing**](?path=/docs/grid-editing--overview); **Approve** a few timesheets above to see it.

### The rowSelection service

In a module of your own, \`runtime.services.find('rowSelection')\` returns the module's service; in a cell or header you draw, \`useGridService('rowSelection')\` does. Both return \`undefined\` in a grid without the module. Custom modules register after the built-in ones, so \`find\` works right in \`onRegister\`.

| \`rowSelection\` | What it does |
|---|---|
| \`getMode()\` | \`'single'\` or \`'multiple'\`. |
| \`selectRecords(provider, ids)\` | Replaces that provider's selection with \`ids\`, through the interceptor below. In a grouped grid, each group's records have a provider of their own. |
| \`toggleRecord(record)\` | What a row's checkbox does: adds the record or takes it out, through the interceptor. In \`'single'\` mode it replaces the selection. |
| \`events\` | Fires \`onSelectionChanged\`, with the same ids the module option gets. |
| \`setInterceptor('onSelectRecords', interceptor)\` | Wraps every selection the grid writes. |

The interceptor is handed \`{ provider, recordIds }\` and the default action. Call \`defaultAction\` with the ids to select, or skip it to refuse; a refused row stays unselected. This module keeps approved timesheets out of every selection the grid makes:

\`\`\`tsx
const APPROVED = 3

//approved timesheets are final
const keepApprovedUnselectedModule: IGridModule = {
    onRegister: runtime => runtime.services.find('rowSelection')?.setInterceptor('onSelectRecords', (parameters, defaultAction) => {
        const records = parameters.provider.getRecordsMap()
        const recordIds = parameters.recordIds.filter(id => Number(records[id]?.getValue('status')) !== APPROVED)
        return defaultAction({ ...parameters, recordIds })
    }),
}
\`\`\`

Pass it in \`modules.custom\`.

- There is room for one interceptor. The grouping module installs its own, which loads a group's records before they are selected and enforces \`maxGroupLoadsPerSelection\`. Yours replaces it, so in a grouped grid that limit no longer applies.
- Unticking the header checkbox does not go through the interceptor, and neither do your own calls to the provider's selection methods.

## Cell ranges and copying

The cell selection module lets people highlight blocks of cells as in a spreadsheet, and the clipboard module copies them out. Both need AG Grid Enterprise.

{{story: Copy a price list into a spreadsheet}}

### Cell ranges

Drag across cells to highlight them, or extend a block from the focused cell with Shift+click and Shift+arrow keys. Ctrl+drag adds another block. \`createCellSelectionModule()\` takes:

| \`createCellSelectionModule\` | Default | What it does |
|---|---|---|
| \`suppressMultiRangeSelection\` | \`false\` | \`true\` keeps one block at a time. |
| \`enableRangeHandle\` | \`false\` | \`true\` draws a handle on the block's corner that resizes it by dragging. |
| \`enableFillHandle\` | \`false\` | \`true\` draws a handle that copies the block's values into the cells it is dragged over, in an editable grid. |
| \`fillHandleDirection\` | \`'xy'\` | Which way the fill handle drags: \`'x'\`, \`'y'\` or \`'xy'\`. |

### Copying

\`createClipboardModule()\` copies with Ctrl+C (Cmd+C on a Mac): the highlighted blocks when there are any, otherwise the focused cell. Every value is copied as the grid shows it, such as a price with its currency symbol or a date in the user's format, with a tab between cells and a line per row, so it pastes into Excel and other spreadsheets as cells. The checkbox column copies as an empty cell.

| \`createClipboardModule\` | Default | What it does |
|---|---|---|
| \`copyHeadersToClipboard\` | \`false\` | \`true\` copies the column headers as the first line. |
| \`suppressCopyRowsToClipboard\` | \`true\` | \`false\` copies the selected rows, with all their columns, when no block is highlighted. |
| \`suppressCopySingleCellRanges\` | \`false\` | \`true\` ignores a block of one cell, which is what a click highlights while \`cellSelection\` is on. With \`suppressCopyRowsToClipboard: false\`, Ctrl+C after a click then copies the selected rows. |
| \`clipboardDelimiter\` | a tab | What goes between cells. |
| \`processCellForClipboard\` | | What a cell copies as. \`params.value\` is the stored value and \`params.formatValue(value)\` formats one, so \`params => params.value\` copies a price as the plain number \`640\`. |
| \`processHeaderForClipboard\` | | What a header copies as. |
| \`sendToClipboard\` | | Hands you the text to copy, in place of writing it to the clipboard. |

It also accepts AG Grid's other clipboard options, listed in \`IGridClipboardOptions\`.

### Pasting and clearing

In an editable grid, Ctrl+V pastes into the focused cell, or into the highlighted block; Ctrl+X copies and clears; Delete and Backspace clear the highlighted cells. Each value reaches the record as if it was typed into the cell:

- Locked cells, and columns drawn with \`oneClickEdit\`, are skipped.
- Text is read the way the grid shows it, as typing it into the cell would read it: numbers and money in the user's number format, durations such as *2 hours*, dates in the user's date format, option sets and two options by their labels, and several option set labels separated by \`;\`. A lookup takes the record of that name, when exactly one record of that name is already in the column's loaded values. Text a column cannot take, and files and images, leave the cell as it was.
- Values are validated like any other edit, and with \`enableAutoSave\` each changed record saves once after the paste.
`

const meta = {
    title: 'Grid/Modules/Selection and clipboard',
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

export const ApproveTimesheetsInBulk: Story = {
    name: 'Approve timesheets in bulk',
    render: () => renderStory(<ApproveInBulkExample />),
    parameters: {
        docs: {
            description: {
                story: `A manager signs off last week's timesheets: \`createRowSelectionModule({ mode: 'multiple', onSelectionChanged })\` feeds the toolbar, which selects and clears through the provider's \`setSelectedRecordIds\` and \`clearSelectedRecordIds\`. Pick **Select all submitted**, then **Approve**, and watch each checkbox cell report its save; sorting a column from its menu clears the selection.`,
            },
        },
    },
}

export const PickOneProduct: Story = {
    name: 'Pick one product',
    render: () => renderStory(<PickOneProductExample />),
    parameters: {
        docs: {
            description: {
                story: `A sales rep picks the product to quote: in \`mode: 'single'\` a click moves the selection and there is no header checkbox, and \`onSelectionChanged\` fills the card beside the grid. Click a few products, then untick the selected one's checkbox.`,
            },
        },
    },
}

export const CopyAPriceListIntoASpreadsheet: Story = {
    name: 'Copy a price list into a spreadsheet',
    render: () => renderStory(<CopyPriceListExample />),
    parameters: {
        docs: {
            description: {
                story: `A sales rep copies part of the price list into a customer's quote: \`createCellSelectionModule()\` highlights a block and \`createClipboardModule({ copyHeadersToClipboard: true })\` copies it with its headers. Drag from a product's name across to its price a few rows down, press Ctrl+C (Cmd+C on a Mac), and paste into the box under the grid, which stands in for a spreadsheet.`,
            },
        },
    },
}
