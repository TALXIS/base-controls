import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { CellsOfYourOwnExample, HeadersOfYourOwnExample } from '../../../../grid/guide/make-it-yours/cellsAndHeadersOfYourOwnExamples'

const STEP = 'Cells and headers of your own'

const DESCRIPTION = `
{{block: progress}}

Probabilities should read at a glance and change with a slider, a weighted value should sit beside them, and an overdue close date should move from its own cell. This step draws a column's cells your way, and adds a column of your own and a cell command; the second example changes the headers.

{{canvas: Cells of your own}}

## How it works

Like [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview), this step starts from *the deal grid*; it adds an \`onSetup\` with a column definitions hook and a commands hook. In **Code**, the new lines carry \`//new:\`.

**A column's cells.** A column of the provider draws its cells with \`Grid.Cell.Renderer\`, and with the editing module edits them with \`EditingCell.Editor\`. Hand them slots through the column definition's \`cellRendererParams\` and \`cellEditorParams\`: each takes \`components\`, the cell's pieces and their slots, and \`theme\`, a Fluent theme the cell's colours are made from in place of the grid's. Everything you leave out keeps drawing as before: the theme, the lock, the commands and the validation message. How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview), and every piece of a cell is under *Slots* on [**Reference**](?path=/docs/controls-grid-reference--overview).

The example gives \`columnControl\`, the piece that draws the value, a slot in each: a ring while the cell shows the probability, a slider while it is edited. \`columnControl.onRender\` is the only slot handed a \`defaultRender\` too, the grid's own drawing, to fall back to for some records.

**Read the cell.** Inside a cell, two React hooks read it, and a component that calls either draws again whenever its record changes:

| React hook | Returns |
|---|---|
| \`useGridCell()\` | The cell: \`getRecord()\`, its column, context and theme, and whether it is locked, loading or edited |
| \`useGridField()\` | The field the cell is bound to: \`getValue()\`, \`getFormattedValue()\`, \`isValid()\` and \`setValue(value)\` |

\`setValue()\` changes the value as an edit does: it stays unsaved until **Save**, or saves at once with auto-save.

**A column of your own.** A definition whose \`colId\` is not a provider column's name adds a column. It holds no value of its own, and its cell is empty until you give it a \`cellRenderer\`. A cell of your own is any component that takes \`IGridCellParams\`; \`WeightedValueCell\` composes it from \`Grid.Cell\`'s parts, so it keeps what each part brings:

| Part | Brings |
|---|---|
| \`Root\` | Makes it a cell of the grid, drawn again when the record changes |
| \`Theme\` | The cell's colours, zebra rows and theme hooks included |
| \`Container\` | The theme's font and text colour |
| \`Control\` | The room the value is drawn in |

A cell bound to one of the provider's columns sits inside \`Grid.Cell.Field\` too; every part is under *Slots* on [**Reference**](?path=/docs/controls-grid-reference--overview). The column takes the grid's header and keeps its \`initialWidth\`. It has no editor and no menu entries, the column layout does not keep it, and group rows and the totals row draw it too, as [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview) says of summary rows. \`WeightedValue\` formats its sum with \`usePcfContext().formatting\`, the formatting the grid itself uses: see [**PCF context**](?path=/docs/concepts-pcf-context--overview). A \`valueGetter\` gives it a value to copy with the clipboard module of [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview).

**Cell commands.** \`cells.hooks.commands\` runs for every cell with \`(result, { record, columnName })\`: push a button to \`result.items\`, or to \`result.overflowItems\` for the **…** menu. A cell shows its commands while its row is hovered, focused or selected. \`grid.services.get('fields').get(record, columnName)\` returns any cell's field, whose \`setValue()\` the command calls.

A cell draws again when its record changes. A cell or a hook that reads anything else draws again only when you ask, as *Redrawing* on [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview) shows.

## Headers of your own

Headers have slots and hooks of their own: *Value* shows the total of the deals under its name, *Discount (%)* an icon, *Close date*'s menu quick filters, and the sort arrow is blue.

{{canvas: Headers of your own}}

**A column's header.** A column draws its header with \`Grid.ColumnHeader.Renderer\`. Hand it slots through the definition's \`headerComponentParams\`, which takes \`components\` and \`theme\` as a cell's params do; the example's \`label\` slot draws the name with the total under it. To lay a header out yourself, set \`headerComponent\` to a component built from \`Grid.ColumnHeader\`'s parts, and read the header in it with \`useGridColumnHeader()\`. The pieces and parts are under *Slots* on [**Reference**](?path=/docs/controls-grid-reference--overview).

**Header hooks.** The hooks on \`grid.services.get('columns').headers.hooks\` run for every header, with the header as the second argument: check \`header.getColDef().colId\` first.

| Hook | Does |
|---|---|
| \`adornments\` | Push \`{ key, placement, title, onRender }\` to draw beside the name, on the side \`placement\` names: \`'prefix'\` or \`'suffix'\`; the \`title\` joins the header's tooltip |
| \`menuSections\` | Push \`{ key, title, items }\` to add a section to the column's menu |
| \`menuItems\` | Changes the menu the sections make: see [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview) |
| \`theme\` | Colours the header: see [**Colours and density**](?path=/docs/controls-grid-guide-make-it-yours-colours-and-density--overview) |

The modules add their sections at \`GRID_MODULE_PRIORITY\`, so *Quick filters* comes after them at \`GRID_MODULE_PRIORITY.aggregation + 1\`; at the default priority it would come first. The menu is built each time it opens. A header draws again after every load, so the total follows the filter.

**The modules' pieces.** Each module takes a \`components\` parameter for what it draws, such as the sorting module's \`sortIcon\`, and the columns a module adds take \`cellRendererParams\` as any other column does. Every module's pieces are under *Slots* on [**Reference**](?path=/docs/controls-grid-reference--overview).

## Try it

- Scroll right: *Probability (%)* draws a ring for each deal. Double-click one: a slider edits it. Move the slider and press Enter: the ring follows.
- *Weighted value* is *Value* × *Probability (%)*. Change either: it follows.
- Scroll right and hover the close date of Ben Carter's *Fabrikam: Support renewal*, which is overdue: an arrow, **Push a week**, shows in the cell. Press it: the date moves to a week from today, the arrow goes, and **Save** appears.
- In *Headers of your own*, *Value*'s header shows $532,500.00, the value of all 30 deals. Open *Close date*'s menu and pick **Overdue**: three deals, worth $62,000.00.
- *Discount (%)*'s header has an info icon; hover the header: its tooltip adds *The CRM refuses a discount over 20%.* Sort by *Value*: the arrow is blue.

## Remember

- \`cellRendererParams\`, \`cellEditorParams\` and \`headerComponentParams\` hand a column's cells and header new slots; the rest draws as before.
- A column of your own needs a cell of your own, built from \`Grid.Cell\`'s parts.
- Commands and header hooks run for every cell or header: check the column first.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Make it yours/Cells and headers of your own',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const CellsOfYourOwn: Story = {
    name: 'Cells of your own',
    tags: ['!dev'],
    render: () => renderStory(<CellsOfYourOwnExample />),
}

export const HeadersOfYourOwn: Story = {
    name: 'Headers of your own',
    tags: ['!dev'],
    render: () => renderStory(<HeadersOfYourOwnExample />),
}
