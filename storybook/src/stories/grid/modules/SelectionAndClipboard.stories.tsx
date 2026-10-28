import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { StarredProductsExample } from '../../../grid/examples/moduleComponentsExamples'
import { ApproveInBulkExample, CopyPriceListExample, PickOneProductExample } from '../../../grid/examples/selectionExamples'

const DESCRIPTION = `
Three modules let users pick the rows they want to act on, highlight blocks of cells, and copy what they highlighted into a spreadsheet. Row selection works with AG Grid Community; cell selection and copying need AG Grid Enterprise: see [**Modules**](?path=/docs/grid-modules--overview).

\`\`\`tsx
<DatasetControl onLoad={loadTimesheets}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelectedIds })]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Approve timesheets in bulk}}

## Row selection

The module adds a checkbox column, \`SELECTION_COLUMN_KEY\`, pinned first.

| Option | Default | Description |
|---|---|---|
| \`mode\` | Required | \`'multiple'\` lets any number of rows be selected, \`'single'\` one at a time. To offer no selection, leave the module out. |
| \`onSelectionChanged\` | None | Called with the ids of the selected records every time the selection changes. |

- The options are read at mount, so the \`onSelectionChanged\` the grid mounted with runs for its whole life. Pass a state setter, as the examples here do, or read anything that changes through a ref.
- To draw the checkbox your own way, set the column's \`cellRenderer\` through \`colDefs\`: see *Changing how it looks* below.

### How users select

| Action | Description |
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

In \`'single'\` mode, a click moves the selection to the row clicked.

{{story: Pick one product}}

### Reading and changing the selection

The selection belongs to the provider, not to the grid: read and change it with the provider's selection methods, and the grid follows. See *Selection* on [**Data providers**](?path=/docs/data-providers--overview).

- \`getSelectedRecordIds()\` leaves group rows out; pass \`{ includeGroupRecordIds: true }\` to include them. Selecting a group row's id selects every record in the group.
- \`provider.getRecordsMap()[id]\` returns the record, the records of loaded groups included.
- A reload clears the selection: sorting, filtering, grouping, \`refresh()\` and moving to another page all start with nothing selected.
- The selection outlives the grid: a grid that mounts over a provider that already has a selection shows those rows selected and scrolls to them.
- \`onSelectionChanged\` is called for every change, your own provider calls and a reload included. Its ids are records only: group rows are left out, and the records of a selected group are in.
- With the editing module, a row's save status is drawn in its checkbox cell: see *The save status* on [**Editing**](?path=/docs/grid-modules-editing--overview).

## Cell ranges and copying

The cell selection module lets users highlight blocks of cells as in a spreadsheet, and the clipboard module copies them out. Both need AG Grid Enterprise.

### Cell ranges

Drag across cells to highlight them, or extend a block from the focused cell with Shift+click and Shift+arrow keys. Ctrl+drag adds another block. \`createCellSelectionModule()\` takes AG Grid's \`CellSelectionOptions\`:

| Option | Default | Description |
|---|---|---|
| \`suppressMultiRanges\` | \`false\` | \`true\` keeps one block at a time. |
| \`handle\` | None | \`{ mode: 'range' }\` draws a handle on the block's corner that resizes it. \`{ mode: 'fill' }\` draws a handle that fills the cells it is dragged over, in an editable grid: numbers continue their series, other values repeat. \`direction\` is \`'x'\`, \`'y'\` or \`'xy'\` (the default). |
| \`enableHeaderHighlight\` | \`false\` | \`true\` highlights the headers of the highlighted columns. |

### Copying

\`createClipboardModule()\` copies with Ctrl+C (Cmd+C on a Mac): the highlighted blocks when there are any, otherwise the focused cell. Every value is copied as the grid shows it, such as a price with its currency symbol or a date in the user's format, with a tab between cells and a line per row, so it pastes into Excel and other spreadsheets as cells. The checkbox column copies as an empty cell.

| Option | Default | Description |
|---|---|---|
| \`copyHeadersToClipboard\` | \`false\` | \`true\` copies the column headers as the first line. |
| \`clipboardDelimiter\` | A tab | What goes between cells. |
| \`processCellForClipboard\` | None | What a cell copies as. \`params.value\` is the stored value, so \`params => params.value\` copies a price as the plain number \`640\`. |
| \`processHeaderForClipboard\` | None | What a header copies as. |
| \`sendToClipboard\` | None | Receives the text to copy, in place of writing it to the clipboard. |
| \`suppressClipboardPaste\`, \`suppressCutToClipboard\` | \`false\` | \`true\` turns pasting, or cutting, off. |
| \`processCellFromClipboard\` | None | Changes each pasted text before the grid reads it. |

\`IGridClipboardOptions\` lists the rest of AG Grid's clipboard options it passes on.

{{story: Copy a price list into a spreadsheet}}

### Pasting and clearing

In an editable grid, Ctrl+V pastes into the focused cell, or into the highlighted block; Ctrl+X copies and clears; Delete and Backspace clear the highlighted cells. Each value reaches the record as if it was typed into the cell:

- Locked cells, and columns drawn with \`oneClickEdit\`, are skipped.
- Text is read as typing it into the cell would read it: numbers and dates in the user's format, durations such as *2 hours*, option sets by their labels (several separated by \`;\`). A lookup takes the record of that name, when exactly one record of that name is already in the column's loaded values.
- Text a column cannot take, and files and images, leave the cell as it was.
- Values are validated like any other edit, and with \`autoSave\` each changed record saves once after the paste.

## From your code

The row selection module's instance is \`grid.modules.find('rowSelection')\`, or \`useGridModule('rowSelection')\` in a part the grid draws. Without the module, \`find\` returns \`undefined\` and \`useGridModule\` throws.

| Member | Description |
|---|---|
| \`getMode()\` | \`'single'\` or \`'multiple'\`. |
| \`selectRecords(provider, ids)\` | Replaces that provider's selection with \`ids\`, through the interceptor below. In a grouped grid, each group's records have a provider of their own. |
| \`toggleRecord(record)\` | What a row's checkbox does: adds the record or takes it out, through the interceptor. In \`'single'\` mode it replaces the selection. |
| \`getRecordSelectionState(node)\` | How a row's checkbox reads: \`'checked'\`, \`'unchecked'\` or \`'indeterminate'\`, for a partly selected group. |
| \`isRecordSelectionDisabled(record)\` | Whether the record's checkbox is disabled, such as a group row in \`'single'\` mode. |
| \`isSelectionColumn(columnName)\` | Whether the column is the checkbox column. |
| \`events\` | Fires \`onSelectionChanged\`, with the same ids the module option gets. |
| \`setInterceptor('onSelectRecords', interceptor)\` | Wraps every selection the grid writes. |

The interceptor receives \`{ provider, recordIds }\` and the default action. Call \`defaultAction\` with the ids to select, or skip it to refuse; a refused row stays unselected. This module keeps approved timesheets out of every selection the grid makes:

\`\`\`tsx
const APPROVED = 3

//approved timesheets are final
const keepApprovedUnselectedModule: IGridModule = {
    name: 'keepApprovedUnselected',
    onLoad: grid => grid.modules.find('rowSelection')?.setInterceptor('onSelectRecords', (parameters, defaultAction) => {
        const records = parameters.provider.getRecordsMap()
        const recordIds = parameters.recordIds.filter(id => Number(records[id]?.getValue('status')) !== APPROVED)
        return defaultAction({ ...parameters, recordIds })
    }),
}
\`\`\`

Add it to \`modules\`, after the row selection module.

- There is room for one interceptor, and the grouping module sets its own. Yours replaces it, so in a grouped grid \`maxGroupLoadsPerSelection\` no longer applies.
- Unticking the header checkbox does not go through the interceptor, and neither do your own calls to the provider's selection methods.

## Changing how it looks

The row selection module adds a checkbox column of its own, keyed \`SELECTION_COLUMN_KEY\`: a checkbox in every row, and one in the header that selects every record. To draw them your own way, set the column's \`cellRenderer\` or \`headerComponent\` in \`colDefs\` to the module's cell or header with \`components\`:

\`\`\`tsx
const StarCell = (props: IGridCellParams) => <SelectionCell {...props} components={STAR} />

<Grid
    modules={[createClientSideRowModelModule(), createRowSelectionModule({ mode: 'multiple' })]}
    colDefs={{ [SELECTION_COLUMN_KEY]: { cellRenderer: StarCell } }} />
\`\`\`

| Cell | Key | Parts | Description |
|---|---|---|---|
| \`SelectionCell\` | \`container\` | \`onRenderContainer\` | The cell the checkbox is drawn in. |
| \`SelectionCell\` | \`checkbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | A row's checkbox, with \`checked\` and \`onChange\`. |
| \`SelectionHeader\` | \`headerCheckbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | The checkbox that selects every record. |

The parts follow the \`components\` rules. See *Replace what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview).

{{story: Star products to order}}
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
                story: `A manager signs off last week's timesheets: \`onSelectionChanged\` feeds the message above the grid, and the ribbon selects and clears through the provider. Try: pick *Select all submitted*, then *Approve*, and watch each checkbox cell report its save.`,
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
                story: `Picking the product to quote with \`mode: 'single'\`, and \`onSelectionChanged\` filling the card beside the grid. Try: click a few products.`,
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
                story: `\`createCellSelectionModule()\` highlights a block and \`createClipboardModule({ copyHeadersToClipboard: true })\` copies it with its headers. Try: drag across a few products, press Ctrl+C and paste into the box under the grid (AG Grid Enterprise).`,
            },
        },
    },
}

export const StarProductsToOrder: Story = {
    name: 'Star products to order',
    render: () => renderStory(<StarredProductsExample />),
    parameters: {
        docs: {
            description: {
                story: `The checkbox column's \`cellRenderer\` is \`SelectionCell\` with \`checkbox\` replaced by a star. Try: star a few products.`,
            },
        },
    },
}
