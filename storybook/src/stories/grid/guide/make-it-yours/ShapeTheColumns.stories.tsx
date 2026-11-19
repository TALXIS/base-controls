import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { ShapeTheColumnsExample } from '../../../../grid/guide/make-it-yours/shapeTheColumnsExamples'

const STEP = 'Shape the columns'

const DESCRIPTION = `
{{block: progress}}

The deal name stays in view and opens the deal, *Recurring* flips in its cell, and the notes read in full but are not offered for sorting. This step shapes the columns with a hook, and leaves the provider's columns as they are.

{{canvas: Shape the columns}}

## How it works

Each step of *Make it yours* and *Advanced* starts again from *the deal grid*: the ribbon of [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview) over a \`ClientSideGrid\` with the row selection, editing, sorting and filtering modules. What else *Features* added, cell ranges, the clipboard, groups, totals, locks and the \`stateKey\`, is left out. This step adds an \`onSetup\` that shapes the columns, and a panel for the deal a user opens. In **Code**, the new lines carry \`//new:\`.

**Services.** The grid is made of services, each found by its key: \`grid.services.get('columns')\` returns the one that builds the columns. How to find the others is on [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview). \`onSetup\` hands you each new grid before it loads, as in [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview).

**Column definitions.** \`columns.hooks.columnDefinitions\` gets the column definitions each time the grid builds its columns: when it is ready, and on every load. A column definition is AG Grid's \`ColDef\` with \`context\`, which holds what the grid itself reads. Find a column by its \`colId\` and change it:

| \`colId\` | The column |
|---|---|
| A provider column's \`name\` | That column |
| \`RECORD_SAVE_COLUMN_KEY\`, \`RECORD_LOCK_COLUMN_KEY\`, \`SELECTION_COLUMN_KEY\`, \`GROUP_EXPANSION_COLUMN_KEY\` | The columns of the editing, row selection and grouping modules, once their hooks have run |
| Any other | A column of your own, as [**Cells and headers of your own**](?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview) adds |

Spread \`context\`, and \`context.cell\`, so the keys the grid set stay. Every key of the column context is under *Columns* on [**Reference**](?path=/docs/controls-grid-reference--overview).

A hook at the default priority runs before the modules, as *How hooks run* on [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview) says, so a module can overwrite what it sets. The sorting module sets \`sortable\` on every column, so the example takes *Notes* out of sorting in a second hook, at \`GRID_MODULE_PRIORITY.sorting + 1\`.

The hook runs again on every load, so a change to anything it reads shows after \`provider.refresh()\`.

**Pin and size.** \`pinned: 'left'\` or \`'right'\` keeps a column at that edge while the others scroll. A column is as wide as its provider column's \`visualSizeFactor\`, or as the definition's \`initialWidth\`. While every column fits, the columns that are not pinned stretch to fill the grid; \`maxWidth\` caps one.

**Link to the record.** \`context.isPrimary: true\` draws each value as a link to its record. A click on it runs \`grid.hooks.openRecord\` with a request:

| Request key | Holds |
|---|---|
| \`record\` | The row's record |
| \`reference\` | The record to open: the row's own, or the one a lookup points to |
| \`columnName\` | The column clicked; none for a double-click on the row |
| \`isHandled\` | Set it to \`true\` once your hook has opened the record |

When no hook handles the request, the provider opens the record. Without the editing module, a double-click on a row opens its record too. \`enableNavigation={false}\` on the grid turns links and opening off.

**Edit in place.** With the editing module, \`context.cell.enableOneClickEdit: true\` draws the column's editing control in each cell, so no editor opens: a two options column becomes a switch. With the cell focused, F2 or typing steps into its control, and Esc steps out. A locked cell draws its control disabled, and grouping turns it off on the columns it groups by.

**Long text.** Text area and multiline columns wrap onto the lines their row has room for, up to six, and the cell's tooltip holds the whole text. The grip on a cell's bottom edge drags its row taller; \`context.cell.isRowResizable\` turns the grip on or off for any column.

**The layout.** Widths, order and visibility live on the provider's columns: when a user drags a column wider or to another place, the grid writes it to them and fires \`onColumnsChanged\`, as [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview) lists. A DatasetControl with a \`stateKey\` keeps them for each view, as the DatasetControl guide's [**Back where they left off**](?path=/docs/controls-datasetcontrol-guide-your-data-back-where-they-left-off--overview) shows. Outside one, save them on \`onColumnsChanged\`, and give them back with \`provider.setColumns()\` before the provider loads. Columns of your own are not kept.

## Try it

- Scroll right: *Deal* stays at the left edge.
- Click a deal's name: a panel opens with the deal in a form.
- Click a *Recurring* switch: it flips without an editor, and **Save** appears.
- Drag the bottom edge of a *Notes* cell down: the row grows, and the note shows in full.
- Open *Notes*' menu: it offers filtering, but no sorting. In **Code**, remove \`GRID_MODULE_PRIORITY.sorting + 1\` from the second hook: sorting is back, since the sorting module now runs after your hook.

## Remember

- A column definitions hook shapes the columns the grid draws, and leaves the provider's columns alone.
- Spread \`context\` and \`context.cell\`, so the grid's own keys stay.
- To change what a module sets, add your hook after it with \`GRID_MODULE_PRIORITY\`.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Make it yours/Shape the columns',
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

export const ShapeTheColumns: Story = {
    name: 'Shape the columns',
    tags: ['!dev'],
    render: () => renderStory(<ShapeTheColumnsExample />),
}
