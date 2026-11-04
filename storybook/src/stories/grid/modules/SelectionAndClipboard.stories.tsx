import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { StarredProductsExample } from '../../../grid/examples/moduleComponentsExamples'
import { ApproveInBulkExample, CopyPriceListExample, PickOneProductExample } from '../../../grid/examples/selectionExamples'

const DESCRIPTION = `
Three modules let users pick the rows they want to act on, highlight blocks of cells, and copy what they highlighted into a spreadsheet. Row selection works with AG Grid Community; cell selection and the clipboard need AG Grid Enterprise (see [**Modules**](?path=/docs/controls-grid-modules--overview)).

{{story: Approve timesheets in bulk}}

## Row selection

The module adds a checkbox column, \`SELECTION_COLUMN_KEY\`, pinned first.

| Option | Type | Default | Description |
|---|---|---|---|
| \`mode\` | \`'single' \\| 'multiple'\` | Required | How many rows may be selected at once. To offer no selection, leave the module out. |
| \`onSelectionChanged\` | \`(selectedRecordIds: string[]) => void\` | None | Called with the ids of the selected records every time the selection changes. |

The options are read at mount, so the \`onSelectionChanged\` the grid mounted with runs for its whole life: pass a state setter, as the examples here do, or read anything that changes through a ref.

| User action | What it does |
|---|---|
| Click a row | Selects that row and clears the others |
| Ctrl+click (Cmd+click on a Mac) | Adds the row to the selection, or takes it out |
| Shift+click | Selects every row from the last one selected to this one |
| Space | Selects the focused row, or takes it out |
| A row's checkbox | Adds the row, or takes it out, and leaves the others as they are |
| The header checkbox | Selects every row on the current page, or every group while the rows are grouped; unticking it clears the selection |

- In \`'single'\` mode every click and every checkbox replaces the selection, and there is no header checkbox.
- A click on a cell's commands does not select the row, and in the checkbox column only the checkbox does.
- In a grouped grid, a plain click on a group row does not select it; Ctrl+click or the group's checkbox selects every record in the group.
- In \`'single'\` mode a group's checkbox is disabled.

How many groups one selection may load is on [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview).

{{story: Pick one product}}

## Read and change the selection

The selection belongs to the provider, not to the grid: read and change it with the provider's selection methods, and the grid follows (see *Selection* on [**Data providers**](?path=/docs/concepts-data-providers--overview)). \`provider.getSelectedRecordIds()\` leaves group rows out unless you pass \`{ includeGroupRecordIds: true }\`, and \`provider.getRecordsMap()[id]\` returns the record, the records of loaded groups included.

When a reload clears the selection is on [**Data providers**](?path=/docs/concepts-data-providers--overview). The selection outlives the grid: a grid that mounts over a provider that already has a selection shows those rows selected and scrolls to them. \`onSelectionChanged\` is called for every change, your own provider calls and a reload included, with the ids of records only: a selected group's records are in, the group row is not.

With the editing module, a row's save status is drawn in its checkbox cell: see *The save status* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview).

## Refuse or change a selection

\`registerSelectRecords(hook, priority?)\` runs before the grid writes a selection to the provider: a click, a checkbox, the header checkbox or \`selectRecords\`. The hook gets \`(selection, { provider })\`:

- Change \`selection.recordIds\` to select something else, or set \`selection.isCancelled\` to refuse it, and the rows go back to what the provider holds.
- Hooks run in priority order and may be \`async\`; each is awaited before the next.
- The grouping module registers one at \`GRID_MODULE_PRIORITY.grouping\` that loads the groups a selection adds.
- Unticking the header checkbox and your own provider calls do not go through the hooks.

\`registerSelectionState(hook, priority?)\` changes how a row's checkbox reads: the hook gets \`(result, { node, record })\` with \`result.state\` as \`'checked'\`, \`'unchecked'\` or \`'indeterminate'\`. The grouping module uses it to show a partly selected group.

## Cell ranges and copying

The cell selection module lets users highlight blocks of cells as in a spreadsheet, and the clipboard module copies them out. Drag across cells to highlight them, or extend a block from the focused cell with Shift+click and Shift+arrow keys; Ctrl+drag adds another block. \`createCellSelectionModule()\` takes AG Grid's \`CellSelectionOptions\`:

| Option | Default | Description |
|---|---|---|
| \`suppressMultiRanges\` | \`false\` | \`true\` keeps one block at a time. |
| \`handle\` | None | \`{ mode: 'range' }\` draws a handle on the block's corner that resizes it. \`{ mode: 'fill' }\` draws one that fills the cells it is dragged over, in an editable grid: numbers continue their series, other values repeat. \`direction\` is \`'x'\`, \`'y'\` or \`'xy'\` (the default). |
| \`enableHeaderHighlight\` | \`false\` | \`true\` highlights the headers of the highlighted columns. |

\`createClipboardModule()\` copies with Ctrl+C (Cmd+C on a Mac): the highlighted blocks when there are any, otherwise the focused cell. Every value is copied as the grid shows it, such as a price with its currency symbol, with a tab between cells and a line per row, so it pastes into a spreadsheet as cells. The checkbox column copies as an empty cell. It takes AG Grid's clipboard options, \`IGridClipboardOptions\`:

| Option | Default | Description |
|---|---|---|
| \`copyHeadersToClipboard\` | \`false\` | \`true\` copies the column headers as the first line. |
| \`clipboardDelimiter\` | A tab | What goes between cells. |
| \`processCellForClipboard\` | None | What a cell copies as. \`params.value\` is the stored value, so \`params => params.value\` copies a price as the plain number \`640\`. |
| \`processHeaderForClipboard\` | None | What a header copies as. |
| \`sendToClipboard\` | None | Receives the text to copy, in place of writing it to the clipboard. |
| \`suppressClipboardPaste\`, \`suppressCutToClipboard\` | \`false\` | \`true\` turns pasting, or cutting, off. |
| \`processCellFromClipboard\` | None | Changes each pasted text before the grid reads it. |

{{story: Copy a price list into a spreadsheet}}

In an editable grid, Ctrl+V pastes into the focused cell or the highlighted block, Ctrl+X copies and clears, and Delete or Backspace clears the highlighted cells. Each value reaches the record as if it was typed:

- Locked cells and in-place columns are skipped.
- Text is read in the user's format: option sets by their labels, several separated by \`;\`.
- Text a column cannot take leaves the cell as it was.
- A lookup takes the record of that name when exactly one record of that name is already among the column's loaded values.
- With \`autoSave\`, each changed record saves once after the paste.

## From your code

The row selection module is \`grid.modules.find('rowSelection')\`, or \`useGridModule('rowSelection')\` inside what the grid draws.

| Member | Description |
|---|---|
| \`getMode()\` | \`'single'\` or \`'multiple'\`. |
| \`selectRecords(provider, ids)\` | Replaces that provider's selection with \`ids\`, through the hooks. In a grouped grid, each group's records have a provider of their own. |
| \`toggleRecord(record)\` | What a row's checkbox does: adds the record or takes it out, through the hooks. In \`'single'\` mode it replaces the selection. |
| \`registerSelectRecords(hook, priority?)\` | See *Refuse or change a selection*. Returns its own unregister. |
| \`registerSelectionState(hook, priority?)\` | See *Refuse or change a selection*. Returns its own unregister. |
| \`getRecordSelectionState(node)\` | How a row's checkbox reads, after the selection state hooks. |
| \`isRecordSelectionDisabled(record)\` | Whether the record's checkbox is disabled, such as a group row in \`'single'\` mode. |
| \`isSelectionColumn(columnName)\` | Whether the column is the checkbox column. |
| \`events\` | \`onSelectionChanged(selectedRecordIds)\`, as the module option. |

The cell selection and clipboard modules have no members of their own.

## Changing how it looks

The row selection module takes no \`components\` option. Its checkbox column draws its cells with \`SelectionCell\` and its header with \`SelectionHeader\`; restyle them in \`colDefs\` through \`cellRendererParams\` and \`headerComponentParams\`, or set \`cellRenderer\` and \`headerComponent\` to a component that renders them. How slots work is on [**DatasetControl › Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`SelectionCell\` | \`container\` | \`onRenderContainer\` | | The cell the checkbox is drawn in |
| | \`checkbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | \`RowSelectionUiCheckboxComponents\` | A row's checkbox. The container takes the click, so keep its \`onClick\`; the checkbox gets \`checked\`, \`indeterminate\`, \`disabled\` and \`styles\` |
| \`SelectionHeader\` | \`headerCheckbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | \`RowSelectionUiHeaderCheckboxComponents\` | The checkbox that selects every row, with \`checked\`, \`indeterminate\` and \`onChange\` |

With the editing module on, the column draws its cells with \`RecordSaveSelectionCell\`, which takes the same \`checkbox\` key: \`cellRendererParams\` reach it too, while a \`cellRenderer\` of your own replaces the save status (see *Changing how it looks* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview)).

{{story: Star products to order}}
`

const meta = {
    title: 'Controls/Grid/Modules/Selection and clipboard',
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
                story: `A manager signs off last week's timesheets, with a \`registerSelectRecords\` hook that keeps approved entries out of every selection. Try: pick *Select all submitted*, then *Approve*.`,
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
                story: `The checkbox column's \`cellRendererParams\` replace \`checkbox.onRenderCheckbox\` with a star; the container still takes the click. Try: star a few products.`,
            },
        },
    },
}
