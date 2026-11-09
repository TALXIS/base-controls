import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { StarredProductsExample } from '../../../grid/examples/moduleComponentsExamples'
import { ApproveInBulkExample, CopyPriceListExample, PickOneProductExample } from '../../../grid/examples/selectionExamples'

const DESCRIPTION = `
Three modules let users pick the rows they want to act on, highlight blocks of cells, and copy what they highlighted into a spreadsheet. Row selection works with AG Grid Community; cell selection and the clipboard need AG Grid Enterprise (see [**Modules**](?path=/docs/controls-grid-modules--overview)). Try it below: press *Select all submitted*, then *Approve*.

{{canvas: Approve timesheets in bulk}}

## Row selection

The module adds a checkbox column, \`SELECTION_COLUMN_KEY\`, pinned first.

| User action | What it does |
|---|---|
| Click a row | Selects that row and clears the others |
| Ctrl+click (Cmd+click on a Mac) | Adds the row to the selection, or takes it out |
| Shift+click | Selects every row from the last one selected to this one |
| Space | Selects the focused row, or takes it out |
| A row's checkbox | Adds the row, or takes it out, and leaves the others as they are |
| The header checkbox | Selects every row on the current page, or every group while the rows are grouped; unticking it clears the selection |

In \`'single'\` mode every click and every checkbox replaces the selection, and there is no header checkbox. A click on a cell's commands does not select the row. In a grouped grid, a plain click on a group row does not select it, while Ctrl+click or the group's checkbox selects every record in the group (see *Grouping and selection* on [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview)).

{{story: Pick one product}}

## Read and change the selection

The selection belongs to the provider, not to the grid: read and change it with the provider's selection methods, and the grid follows (see *Selection* on [**Data providers**](?path=/docs/concepts-data-providers--overview)). \`provider.getSelectedRecordIds()\` leaves group rows out unless you pass \`{ includeGroupRecordIds: true }\`, and \`provider.getRecordsMap()[id]\` returns the record, the records of loaded groups included.

To follow the selection, listen to the provider's \`onRecordsSelected(selectedRecordIds)\` event, as *Pick one product* does, and remove the listener when your component unmounts. A grid that mounts over a provider that already has a selection shows those rows selected and scrolls to them. With the editing module, a row's save status is drawn in its checkbox cell.

## Refuse or change a selection

\`hooks.selectRecords.add(hook, priority?)\` runs before the grid writes a selection to the provider: from a click, a checkbox, the header checkbox or \`selectRecords\`. The hook gets \`(selection, { provider })\`: change \`selection.recordIds\` to select something else, or set \`selection.isCancelled\` to refuse it, and the rows go back to what the provider holds. Hooks may be \`async\`, and each is awaited before the next. Unticking the header checkbox and your own provider calls do not go through them.

\`hooks.selectionState.add(hook, priority?)\` changes how a row's checkbox reads: the hook gets \`(result, { node, record })\` with \`result.state\` as \`'checked'\`, \`'unchecked'\` or \`'indeterminate'\`. The grouping module uses it to show a partly selected group.

## Cell ranges and copying

The cell selection module lets users highlight blocks of cells as in a spreadsheet, and the clipboard module copies them out.

| User action | What it does |
|---|---|
| Drag across cells | Highlights a block |
| Shift+click, Shift+arrow keys | Extends the block from the focused cell |
| Ctrl+drag | Adds another block |
| Ctrl+C (Cmd+C on a Mac) | Copies the highlighted blocks, or the focused cell when there are none |

Every value is copied as the grid shows it, such as a price with its currency symbol, with a tab between cells and a line per row, so it pastes into a spreadsheet as cells.

{{story: Copy a price list into a spreadsheet}}

In an editable grid, Ctrl+V pastes into the focused cell or the highlighted block, Ctrl+X copies and clears, and Delete or Backspace clears the highlighted cells. Each value reaches the record as if it was typed, in the user's format: option sets by their labels, several separated by \`;\`. Locked cells and in-place columns are skipped, text a column cannot take leaves the cell as it was, and with \`enableAutoSave\` each changed record saves once after the paste.

## Options

The options are *At mount*: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

| \`createRowSelectionModule\` option | Type | Default | Description |
|---|---|---|---|
| \`mode\` | \`'single' \\| 'multiple'\` | Required | How many rows may be selected at once. To offer no selection, leave the module out. |

\`createCellSelectionModule()\` takes AG Grid's \`CellSelectionOptions\`:

| Option | Default | Description |
|---|---|---|
| \`suppressMultiRanges\` | \`false\` | \`true\` keeps one block at a time. |
| \`handle\` | None | \`{ mode: 'range' }\` draws a handle that resizes the block; \`{ mode: 'fill' }\` one that fills the cells it is dragged over in an editable grid: numbers continue their series, other values repeat. \`direction\` is \`'x'\`, \`'y'\` or \`'xy'\` (the default). |
| \`enableHeaderHighlight\` | \`false\` | \`true\` highlights the headers of the highlighted columns. |

\`createClipboardModule()\` takes AG Grid's clipboard options, \`IGridClipboardOptions\`:

| Option | Default | Description |
|---|---|---|
| \`copyHeadersToClipboard\` | \`false\` | \`true\` copies the column headers as the first line. |
| \`clipboardDelimiter\` | A tab | What goes between cells. |
| \`processCellForClipboard\` | None | What a cell copies as. \`params.value\` is the stored value, so \`params => params.value\` copies a price as the plain number \`640\`. |
| \`processHeaderForClipboard\` | None | What a header copies as. |
| \`sendToClipboard\` | None | Receives the text to copy, in place of writing it to the clipboard. |
| \`suppressClipboardPaste\`, \`suppressCutToClipboard\` | \`false\` | \`true\` turns pasting, or cutting, off. |
| \`processCellFromClipboard\` | None | Changes each pasted text before the grid reads it. |

## Changing how it looks

The row selection module takes no \`components\` option. Its checkbox column draws its cells with \`SelectionCell\` and its header with \`SelectionHeader\`; restyle them from a column definitions hook at \`GRID_MODULE_PRIORITY.clipboard + 1\`, after every built-in module, through \`cellRendererParams\` and \`headerComponentParams\`, or set \`cellRenderer\` and \`headerComponent\` to a component that renders them. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`SelectionCell\` | \`container\` | \`onRenderContainer\` | | The cell the checkbox is drawn in |
| | \`checkbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | \`RowSelectionUiCheckboxComponents\` | A row's checkbox. The container takes the click, so keep its \`onClick\`; the checkbox gets \`checked\`, \`indeterminate\`, \`disabled\` and \`styles\` |
| \`SelectionHeader\` | \`headerCheckbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | \`RowSelectionUiHeaderCheckboxComponents\` | The checkbox that selects every row, with \`checked\`, \`indeterminate\` and \`onChange\` |

With the editing module on, the column draws its cells with \`RecordSaveSelectionCell\`, which takes the same \`checkbox\` key: \`cellRendererParams\` reach it too, while a \`cellRenderer\` of your own replaces the save status (see *Changing how it looks* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview)).

{{story: Star products to order}}

## Reference

### Members

The row selection module is \`grid.modules.find('rowSelection')\`, or \`useGridModule('rowSelection')\` inside what the grid draws. The cell selection and clipboard modules have no members of their own.

| Member | Description |
|---|---|
| \`getMode()\` | \`'single'\` or \`'multiple'\`. |
| \`selectRecords(provider, ids)\` | Replaces that provider's selection with \`ids\`, through the hooks. In a grouped grid, each group's records have a provider of their own. |
| \`toggleRecord(record)\` | What a row's checkbox does: adds the record or takes it out, through the hooks. In \`'single'\` mode it replaces the selection. |
| \`hooks.selectRecords.add(hook, priority?)\` | See *Refuse or change a selection*. Returns the function that removes the hook. |
| \`hooks.selectionState.add(hook, priority?)\` | See *Refuse or change a selection*. Returns the function that removes the hook. |
| \`getRecordSelectionState(node)\` | How a row's checkbox reads, after the selection state hooks. |
| \`isRecordSelectionDisabled(record)\` | Whether the record's checkbox is disabled, such as a group row in \`'single'\` mode. |
| \`isSelectionColumn(columnName)\` | Whether the column is the checkbox column. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Editing', iconName: 'Edit', href: '?path=/docs/controls-grid-modules-editing--overview', text: 'Edit values in place, and paste blocks of cells back in.' },
    { title: 'Grouping and totals', iconName: 'GroupList', href: '?path=/docs/controls-grid-modules-grouping-and-totals--overview', text: 'Group the rows, and select a whole group at once.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Read and change the selection the provider holds.' },
]

const meta = {
    title: 'Controls/Grid/Modules/Selection and clipboard',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const PickOneProduct: Story = {
    name: 'Pick one product',
    render: () => renderStory(<PickOneProductExample />),
    parameters: {
        docs: {
            description: {
                story: `\`mode: 'single'\` picks the product to quote, and the provider's \`onRecordsSelected\` names it above the grid. Try: click a few products.`,
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
                story: `\`createClipboardModule({ copyHeadersToClipboard: true })\` copies a highlighted block with its headers. Try: copy a few products and paste them into the box under the grid (AG Grid Enterprise).`,
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
