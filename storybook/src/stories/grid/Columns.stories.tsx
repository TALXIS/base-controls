import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import {
    HeaderExample, KeyColumnsExample, LongNotesExample, ProductLinkExample, RememberLayoutExample, RowCommandsExample, StockValueExample,
} from '../../grid/examples/columnsExamples'

const DESCRIPTION = `
Every column of the provider becomes a column of the grid, drawn and edited by its data type. \`colDefs\` changes any of them and adds columns of your own: pin and size them, turn a value into a link to its record, work a value out, give every row its commands, and add to a header and its menu. Most examples on this page work with an office furniture shop's products.

{{story: Keep key columns in view}}

## Changing a column

\`colDefs\` is an object keyed by column id, and a provider column's id is its \`name\`. An entry (\`IGridColDefOverride\`) takes any key of an AG Grid column definition (\`pinned\`, \`maxWidth\`, \`hide\`, \`headerName\`, \`cellRenderer\`, \`valueGetter\` and the rest) and the grid's own \`settings\`, listed under *Reference* below.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{
        name: { pinned: 'left', settings: { isPrimary: true } },
        price: colDef => ({ headerName: colDef.headerName + ' (excl. VAT)' }),
        stockvalue: { headerName: 'Stock value', initialWidth: 130, cellRenderer: StockValueCell },
    }} />
\`\`\`

- **An entry for a provider column is merged over it.** \`settings\`, \`settings.cell\` and \`settings.header\` are merged one level deeper, so an entry can set one callback and keep the others.
- **Any other key adds a column**, after every other column, in the order of the keys. See *Columns of your own* below.
- **A function** in place of an entry is handed the column as the grid and its modules built it, and returns what to change. An added column's function is handed \`{ colId }\`.
- **\`colDefs\` has the last word.** It is applied after every module: \`pinned: null\` unpins a column that grouping pinned, and \`sortable: false\` takes Sorting out of a column's menu.
- **\`colDefs\` is read whenever the grid builds its columns**: when the grid is ready, and after every load of the provider. A changed \`colDefs\` shows after the next \`provider.refresh()\`, or when you remount the grid with a new \`key\`. The callbacks in it are the ones from the last build, so read state that changes through a ref, not through a closure over React state.
- **Leave a provider column's \`cellRendererSelector\` alone** while grouping or totals are on: those modules draw group rows and the totals row through it, and an entry that sets one replaces theirs. Change how the cells look through \`cellRenderer\` instead. A \`valueGetter\` or \`valueFormatter\` of your own also replaces the value the totals and group rows copy.
- **The grid's own columns have keys too**, so \`colDefs\` can reach them: \`RECORD_SAVE_COLUMN_KEY\` and \`RECORD_LOCK_COLUMN_KEY\` (the save status and the record lock, with editing on), \`DataProvider.CONST.CHECKBOX_COLUMN_KEY\` (row selection) and \`GROUP_EXPANSION_COLUMN_KEY\` (while grouped).

### Pinning

- \`pinned: 'left'\` or \`'right'\` keeps a column at that edge while the others scroll sideways.
- Users cannot pin or unpin a provider column by dragging it: pinning is yours.
- The grid's own columns sit pinned left, before yours. While the rows are grouped, the grouped columns are pinned left too: see [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

### Widths

- A provider column starts at its \`visualSizeFactor\`, or at \`DEFAULT_COLUMN_WIDTH\` (200) without one.
- **While every column fits the grid**, the unpinned provider columns share out its width in proportion to these numbers: a column of 160 gets twice the room of a column of 80.
- **Once they overflow**, the same numbers are widths in pixels and the grid scrolls sideways.
- Pinned columns and added columns keep their width either way. Cap a column that must not stretch with \`maxWidth\`, or pin it.
- \`initialWidth\` in \`colDefs\` takes the place of \`visualSizeFactor\`. Prefer it to \`width\`, which AG Grid applies again at every load and which can undo a width the user dragged to.
- A width the user drags a column to is kept and written to its \`visualSizeFactor\`: see *Remembering the layout* below. Users can also drag a column to another place, unless \`colDefs\` sets \`suppressMovable: true\`.

{{story: Open a product from its name}}

## Links to the record

- \`settings.isPrimary: true\` draws a column's value as a link to its record. It defaults to the provider column's \`isPrimary\`; the provider's primary name column is no link until you set it.
- A click on the link, or a double-click on a cell while editing is off, opens the record through \`provider.openDatasetItem()\`. To do something else, pass \`onOpenRecord\` to \`<Grid.Root />\`: it gets \`{ record, reference, columnName }\` and replaces opening. Call \`provider.openDatasetItem(reference)\` in it to open the record after all.
- With \`enableNavigation={false}\` the value is plain text and a double-click opens nothing ([**Props and events**](?path=/docs/grid-get-started-props-and-events--overview)).

{{story: Work out the stock value}}

## Columns of your own

A key of \`colDefs\` that names no provider column adds a column.

- **Give it a \`cellRenderer\`.** Without one its cells draw nothing but their commands, which is all an actions column needs.
- **Build the renderer from \`Grid.Cell.Root\`, \`Grid.Cell.Theme\` and \`Grid.Cell.Container\`**, so the cell keeps the grid's colours, hover and focus. Every part is on [**Custom Components**](?path=/docs/grid-appearance-custom-components--overview).
- **Read the record in a component inside \`Grid.Cell.Root\`**, through \`useGridCell()\`. That component is drawn again when the record changes; the renderer itself is not, so a value it works out goes stale after an edit.
- **Give it a \`valueGetter\`** for the value that copying carries ([**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview)).
- **Place it with \`pinned\`.** It comes after every other column. A user can drag it elsewhere, but it goes back to the end at the next load.
- **Size it with \`initialWidth\`.** It never stretches to fill the grid. Its width and place are not written to the provider, so \`onColumnsChanged\` carries nothing for it.
- Its menu is empty: sorting, filtering, grouping and totals work on provider columns. \`settings.header\` can still give it one.
- It opens no editor unless it has a \`cellEditor\`, and a double-click on it opens no record.
- Group rows and the totals row draw it too, with the group's or the totals' record. Draw nothing there when \`record.getDataProvider().getSummarizationType() !== 'none'\`.

{{story: Reorder from the row}}

## Row commands

\`settings.cell.onGetCommands(result, { record })\` decides what the column's cells offer.

- Push Fluent \`ICommandBarItemProps\` to \`result.items\` for buttons, and to \`result.overflowItems\` for the menu behind the overflow button. Buttons that do not fit the cell move into that menu too, so give each one a \`text\`; \`iconOnly: true\` draws just the icon, with the text as its tooltip.
- Commands show while the row is hovered, focused or selected. They are worked out each time the cell draws them, so they can depend on the record.
- In an added column with no \`cellRenderer\`, the commands are all the cell draws. In a provider column they sit after the value, or before it in a right-aligned column.
- It runs after every \`registerCellCommandsHook\` ([**Hooks**](?path=/docs/grid-extending-hooks--overview)), and for group rows and the totals row too.

{{story: Flag low stock in the header}}

## The header

A click on a header, or Enter on a focused one, opens its menu; sorting is an item in that menu, not a click on the header. \`settings.header\` adds to what a header draws and offers.

- \`onGetAdornments(adornments)\` adds what the header draws beside its name: push \`{ key, placement: 'prefix' | 'suffix', title?, onRender? }\`. A \`title\` joins the header's tooltip in parentheses, and an adornment with only a \`title\` draws nothing.
- \`onGetMenuSections(sections)\` adds to the menu: push \`{ key, title, items }\` with Fluent \`IContextualMenuItem\` items, or remove a module's section by its key. A section with no items is left out.
- \`onGetMenuItems(items)\` changes the menu once its sections are laid out as items, headings included.
- \`onGetTheme(theme)\` colours the header: see [**Appearance**](?path=/docs/grid-appearance--overview).
- The menu is worked out each time it opens. Adornments and the theme are worked out each time the header draws: after every load of the provider, and when you call \`runtime.services.get('columns').headers.render()\`. Call it after a change the header reads but its column does not carry, such as the values of the records.
- Each runs after the matching \`columns.headers\` hook ([**Hooks**](?path=/docs/grid-extending-hooks--overview)), so the column has the last word.

{{story: Read long notes}}

## Long text

- A multiline text (\`Multiple\`) or text area (\`SingleLineTextArea\`) column wraps its text and cuts it off at the lines its row fits, six at most. The whole text shows in the cell's tooltip.
- Its cells draw a grip on their bottom edge while hovered. Dragging it sets that row's height, which the grid keeps for as long as it is mounted, over any height a row height hook or \`rowSettings.onGetHeight\` gives.
- \`settings.cell.isRowResizable\` turns the grip, and the wrapping with it, on for any column, or off for these. An AG Grid \`autoHeight\` column wraps its text and draws the grip too.
- Rows start at \`rowHeight\`, 42 pixels unless \`<Grid.Root />\` sets another ([**Props and events**](?path=/docs/grid-get-started-props-and-events--overview)).

{{story: Remember the layout}}

## Remembering the layout

\`onColumnsChanged(columns)\` fires when the user finishes resizing or moving a column. By then the grid has written the change to the provider's columns, a width to \`visualSizeFactor\` and a place to \`order\`, and it hands you those columns.

- Save each column's \`name\`, \`visualSizeFactor\` and \`order\`. Next time, put them on the provider's columns with \`setColumns()\` before its first \`refresh()\`.
- An autosize, such as a double-click on a column's edge, is not reported, and the columns \`colDefs\` adds are not among the columns it hands you.
- Sorting and filtering are kept on the provider too: see *Saved views* on [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview).

Do not restore a layout through the \`state\` prop. It is AG Grid's \`initialState\`, applied once to the first columns, and the grid takes over from there: it lays the widths out again from \`visualSizeFactor\`, puts the columns back in the provider's order at the next load, and a \`sort\` in it sorts AG Grid's rows rather than the provider's, with no arrow in the header.

## Reference

### \`settings\` (\`IGridColumnSettings\`)

| Key | Default | What it does |
|---|---|---|
| \`alignment\` | \`'right'\` for whole numbers, decimals and currency, \`'left'\` for the rest | Which edge the cells' values and commands and the header's name sit against: \`'left'\`, \`'center'\` or \`'right'\`. |
| \`isLocked\` | \`true\` when the column's \`metadata.IsValidForUpdate\` is \`false\` | Locks every cell of the column for good: no lock hook can unlock it. With editing on, the header shows a lock. \`false\` unlocks a column the metadata locks. See [**Editing**](?path=/docs/grid-editing--overview). |
| \`isPrimary\` | the provider column's \`isPrimary\` | Draws the value as a link that opens the record. |
| \`isRequired\` | \`true\` with editing on and \`metadata.RequiredLevel\` 1 or 2 | Draws the red \`*\` after the header's name, and nothing more: what makes a value required is on [**Editing**](?path=/docs/grid-editing--overview). |
| \`widthOffset\` | none; grouping adds 80 to a grouped column | Pixels added to a provider column's width and never written to its \`visualSizeFactor\`. |
| \`cell\` | | How each of the column's cells behaves: the next table. |
| \`header\` | | What the column's header draws and offers: the table after it. |

### \`settings.cell\` (\`IGridColumnCellSettings\`)

Each callback is handed \`{ record }\`, runs after the cell hooks of its kind, and runs for group rows and the totals row too.

| Key | Default | What it does |
|---|---|---|
| \`oneClickEdit\` | \`false\` | Draws the input in the cell itself, with no editor to open. See [**Editing**](?path=/docs/grid-editing--overview). |
| \`isRowResizable\` | \`true\` for multiline text and text area columns | Wraps the text and draws the grip a row is dragged taller by. |
| \`onGetCommands(result, { record })\` | | Push \`ICommandBarItemProps\` to \`result.items\` and \`result.overflowItems\`. |
| \`onGetTheme(theme, { record })\` | | Colours the cell: set \`theme.colors.background\`, \`text\` or \`primary\`. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`onGetLock(result, { record })\` | | Set \`result.isLocked\` to lock the cell. See [**Editing**](?path=/docs/grid-editing--overview). |
| \`onGetValidation(result, { record })\` | | Set \`result.error\` and \`result.errorMessage\` to refuse the value. See [**Editing**](?path=/docs/grid-editing--overview). |
| \`onGetLoading(result, { record })\` | | Set \`result.isLoading\` to draw a shimmer in place of the cell's content. Nothing redraws by itself when the answer changes: call \`runtime.services.get('cells').render()\`. |
| \`onGetControlParameters(parameters, { record })\` | | Changes the parameters the cell's control is handed. See [**Hooks**](?path=/docs/grid-extending-hooks--overview). |

### \`settings.header\` (\`IGridColumnHeaderSettings\`)

Each callback runs after the \`columns.headers\` hooks of its kind.

| Key | Worked out | What it does |
|---|---|---|
| \`onGetTheme(theme)\` | when the header draws | Colours the header: set \`theme.colors.background\`, \`text\` or \`primary\`. |
| \`onGetAdornments(adornments)\` | when the header draws | Push \`{ key, placement, title?, onRender? }\` to draw beside the name. |
| \`onGetMenuSections(sections)\` | when the menu opens | Push \`{ key, title, items }\`, or remove a section by its key. |
| \`onGetMenuItems(items)\` | when the menu opens | Change the items the sections became. Each section starts with a heading item keyed by the section's key and \`Header\`, such as \`sortingHeader\`. |

The modules' sections and items take these keys:

| Module | Section | Items |
|---|---|---|
| Sorting | \`sorting\` | \`sort_asc\`, \`sort_desc\`, \`clear\` |
| Filtering | \`filtering\` | \`filter\`, \`clearFilter\` |
| Grouping | \`grouping\` | \`group\` |
| Totals | \`aggregation\` | \`none\`, and one per total: \`sum\`, \`avg\`, \`min\`, \`max\`, \`count\`, \`countcolumn\` |
`

const meta = {
    title: 'Grid/Columns',
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

export const KeepKeyColumnsInView: Story = {
    name: 'Keep key columns in view',
    render: () => renderStory(<KeyColumnsExample />),
    parameters: {
        docs: {
            description: {
                story: `A product list too wide for the grid: \`pinned\` keeps Product at the left edge and Category at the right while the rest scroll, and \`maxWidth\` keeps Photo narrow. Switch *Show every column* off: what is left fits, so Price and In stock stretch to fill the grid and Photo stops at its \`maxWidth\`.`,
            },
        },
    },
}

export const OpenAProductFromItsName: Story = {
    name: 'Open a product from its name',
    render: () => renderStory(<ProductLinkExample />),
    parameters: {
        docs: {
            description: {
                story: `A shop assistant looks a product up: \`settings.isPrimary\` draws Product as a link, and \`onOpenRecord\` opens the product's details in a panel. Click a product's name, or double-click its row.`,
            },
        },
    },
}

export const WorkOutTheStockValue: Story = {
    name: 'Work out the stock value',
    render: () => renderStory(<StockValueExample />),
    parameters: {
        docs: {
            description: {
                story: `A buyer wants what each product's stock is worth: an added column multiplies Price by In stock, drawn with \`Grid.Cell.Root\`, \`Theme\` and \`Container\` and read through \`useGridCell()\`. Double-click a price or a stock count, change it, and the stock value follows.`,
            },
        },
    },
}

export const ReorderFromTheRow: Story = {
    name: 'Reorder from the row',
    render: () => renderStory(<RowCommandsExample />),
    parameters: {
        docs: {
            description: {
                story: `An actions column pinned right offers what a buyer does with a product: \`settings.cell.onGetCommands\` adds Reorder to the products below their reorder level, and Copy SKU and Discontinue to the overflow menu. Hover Corner desk, which is running low, and reorder it; then discontinue Floor lamp and watch its Reorder go.`,
            },
        },
    },
}

export const FlagLowStockInTheHeader: Story = {
    name: 'Flag low stock in the header',
    render: () => renderStory(<HeaderExample />),
    parameters: {
        docs: {
            description: {
                story: `A buyer watches stock from the In stock header: \`settings.header.onGetAdornments\` draws a badge counting the products below their reorder level, and \`settings.header.onGetMenuSections\` adds Quick filters to the column's menu. Open the In stock menu and pick *Out of stock*, or change a stock count and watch the badge follow.`,
            },
        },
    },
}

export const ReadLongNotes: Story = {
    name: 'Read long notes',
    render: () => renderStory(<LongNotesExample />),
    parameters: {
        docs: {
            description: {
                story: `A sales pipeline whose notes run long: a \`Multiple\` column wraps its text, cuts it off at the lines its row fits, and draws a grip to drag the row taller. Next step is a text area too, but holds a short phrase, so \`settings.cell.isRowResizable: false\` keeps it on one line. Hover a long note and drag the grip on its bottom edge.`,
            },
        },
    },
}

export const RememberTheLayout: Story = {
    name: 'Remember the layout',
    render: () => renderStory(<RememberLayoutExample />),
    parameters: {
        docs: {
            description: {
                story: `A product list that opens the way its user left it: \`onColumnsChanged\` hands over each column's \`visualSizeFactor\` and \`order\`, and *Reopen the list* opens a new provider with them on its columns. Widen a column or drag one elsewhere, then reopen the list.`,
            },
        },
    },
}
