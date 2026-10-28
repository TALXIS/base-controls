import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { AutoHeightExample, HeaderExample, KeyColumnsExample, LongNotesExample, ProductLinkExample, RememberLayoutExample, RowCommandsExample, StockValueExample } from '../../grid/examples/columnsExamples'

const DESCRIPTION = `
Every provider column becomes a grid column. \`colDefs\` changes those columns and adds your own: pin them, link them to their record, calculate their values, give their cells commands and their headers menus. What the grid reads from the provider's columns themselves is on [**Data**](?path=/docs/grid-data--overview).

\`\`\`tsx
<DatasetControl onLoad={loadProducts}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule()]}
            colDefs={{
                name: { pinned: 'left', context: { isPrimary: true } },
                price: colDef => ({ headerName: colDef?.headerName + ' (excl. VAT)' }),
                stockvalue: { headerName: 'Stock value', initialWidth: 130, cellRenderer: StockValueCell },
            }} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

## Change a column

\`colDefs\` is keyed by column id, which is the provider column's \`name\`. An entry takes any AG Grid column definition key, plus \`context\`: what the grid itself reads about the column, listed under *The column context* below.

- An entry for an existing column is merged over it, \`context\`, \`context.cell\` and \`context.header\` included, so you change only what you set. Any other key adds a column at the end.
- A function entry receives the column as built (\`null\` for an added one) and returns what to change.
- \`colDefs\` runs after every module, so it overrides what they set.
- The grid's own columns have keys too: \`RECORD_SAVE_COLUMN_KEY\`, \`RECORD_LOCK_COLUMN_KEY\`, \`SELECTION_COLUMN_KEY\` and \`GROUP_EXPANSION_COLUMN_KEY\`.
- Keys of your own in \`context\` sit beside the grid's, and \`getColumnContext(colDef)\` reads them back, such as in a cell of your own.

## Pin and size columns

\`pinned: 'left'\` or \`'right'\` keeps a column at that edge. A column's width comes from its provider column's \`visualSizeFactor\`, or \`initialWidth\` in \`colDefs\`; columns stretch to fill the grid, and \`maxWidth\` caps one.

{{story: Keep key columns in view}}

## Link to the record

\`context.isPrimary: true\` draws the value as a link to its record. Clicking it, or double-clicking a row while editing is off, opens the record; pass \`onOpenRecord\` to \`<Grid />\` to do something else. \`enableNavigation={false}\` turns links and opening off.

{{story: Open a product from its name}}

## Add a calculated column

Give \`colDefs\` a key that isn't a provider column, and calculate its value from the record:

- \`valueGetter\` returns the value. Copying uses it too.
- \`cellRenderer\` draws the cell: reuse the grid's cell or build your own, both on [**Custom cells**](?path=/docs/grid-appearance-custom-cells--overview). Read the record with \`useGridCell()\` inside it, so the value follows the record.
- The column is placed last and keeps its \`initialWidth\`. It has no menu or editor, and is not kept with the column layout.
- Group rows and the totals row draw it too, so draw nothing for them. See *Summary rows* on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

{{story: Calculate the stock value}}

## Add cell commands

\`context.cell.onGetCommands(result, { record })\` adds commands to the column's cells. They show while the row is hovered, focused or selected, and are asked for each time, so they can depend on the record.

- Push \`ICommandBarItemProps\` to \`result.items\` for buttons, or to \`result.overflowItems\` for the **…** menu. Give each a \`text\`; \`iconOnly: true\` shows just the icon.

{{story: Reorder from the row}}

## Extend the header

Clicking a header opens its menu. \`context.header\` adds to the header and its menu:

- \`onGetAdornments(adornments)\`: push \`{ key, placement: 'prefix' | 'suffix', title?, onRender? }\` to draw beside the name.
- \`onGetMenuSections(sections)\`: push \`{ key, title, items }\`, or remove a module's section by its key.
- \`onGetMenuItems(items)\`: change the final menu items.
- \`onGetTheme(theme)\`: colour the header. See *Colour column headers* on [**Appearance**](?path=/docs/grid-appearance--overview).

The menu is built each time it opens, and adornments each time the header draws. After a change the header should show, see *Redrawing* on [**Talking to the grid**](?path=/docs/grid-talking-to-the-grid--overview).

{{story: Flag low stock in the header}}

## Show long text

Multiline text and text area columns wrap, up to six lines, with the full text in the tooltip. Users can drag a row taller by the grip on a cell's bottom edge; \`context.cell.isRowResizable\` turns the grip on or off for any column.

{{story: Read long notes}}

To size rows to the text instead, set AG Grid's \`autoHeight: true\` on the column: each row grows to fit its text, still up to six lines.

{{story: Fit rows to their notes}}

## Remember the layout

The widths, order and visibility of the columns live on the provider's columns. Inside a DatasetControl with a \`stateKey\`, the control keeps them per view: see [**DatasetControl › State**](?path=/docs/datasetcontrol-state--overview). Columns added through \`colDefs\` are not kept.

A grid on its own keeps nothing. \`onColumnsChanged(columns)\` fires after the user resizes or moves a column, with the provider's columns updated: save each one's \`name\`, \`visualSizeFactor\` and \`order\`, and apply them with \`setColumns()\` before you load the provider.

{{story: Remember the layout}}

## The column context

What the grid reads from a column's \`context\`. The \`cell\` and \`header\` callbacks run after the hooks of their kind on [**Hooks**](?path=/docs/grid-extending-hooks--overview), so a column overrides them.

| Key | Type | Description |
|---|---|---|
| \`isPrimary\` | \`boolean\` | Draws the value as a link to the record. |
| \`isRequired\` | \`boolean\` | Draws the required marker in the header. It validates nothing: see *Validation* on [**Editing**](?path=/docs/grid-modules-editing--overview). |
| \`isLocked\` | \`boolean\` | Locks the column for good, with the editing module. See *Locks* on [**Editing**](?path=/docs/grid-modules-editing--overview). |
| \`alignment\` | \`'left' \\| 'center' \\| 'right'\` | Which edge the value reads from. |
| \`cell.isRowResizable\` | \`boolean\` | Draws the grip a row is dragged taller by. |
| \`cell.oneClickEdit\` | \`boolean\` | Draws the editing control in the cell itself. See *Edit in place* on [**Editing**](?path=/docs/grid-modules-editing--overview). |
| \`cell.onGetCommands\` | \`(result, { record }) => void\` | The cell's commands. See *Add cell commands* above. |
| \`cell.onGetTheme\` | \`(theme, { record }) => void\` | The cell's colours. See *Colour cells by their data* on [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`cell.onGetLoading\` | \`(result, { record }) => void\` | Draws a shimmer in place of the value while \`result.isLoading\`. |
| \`cell.onGetLock\` | \`(result, { record }) => void\` | Locks the cell. See *Locks* on [**Editing**](?path=/docs/grid-modules-editing--overview). |
| \`cell.onGetValidation\` | \`(result, { record }) => void\` | Marks the value invalid. See *Validation* on [**Editing**](?path=/docs/grid-modules-editing--overview). |
| \`cell.onGetControlParameters\` | \`(parameters, { record }) => void\` | The parameters the cell's control receives. See *Control parameters* below. |
| \`header.onGetAdornments\`, \`header.onGetMenuSections\`, \`header.onGetMenuItems\`, \`header.onGetTheme\` | Callbacks | See *Extend the header* above. |

### Control parameters

\`cell.onGetControlParameters\`, and the \`registerControlParameters\` hook, change what a cell's control receives. Each parameter is an object with a \`raw\` value, such as \`{ raw: 'Unassigned' }\`. A cell that only shows its value is drawn by the grid's value renderer, which reads these:

| Parameter | Description |
|---|---|
| \`Placeholder\` | The text an empty cell shows. Default \`---\`. |
| \`PrefixIcon\`, \`SuffixIcon\` | The name of a Fluent icon drawn before or after the value. |
| \`IsPrimaryColumn\` | \`true\`, with \`EnableNavigation\` also \`true\`, draws the value as a link that opens the record. |
| \`EnableNavigation\` | \`false\` draws emails, phones, URLs, lookups and the primary column as plain text. |
| \`EnableOptionSetColors\` | \`true\` draws options that have a colour as tags. |
| \`IsMultiline\` | \`true\` wraps the text onto the lines its row has room for, up to six. |
| \`ColumnAlignment\` | \`'left'\`, \`'center'\` or \`'right'\`. |

- An editor, and a cell drawn with \`oneClickEdit\`, is drawn by the column's editing control, which takes that control's own parameters; the text field also reads \`Placeholder\`.
- The value renderer reads the value from the record, so changing \`value\` here shows nothing. To change how a value reads, use \`record.expressions.setFormattedValueExpression\`: see *Record expressions* on [**Data providers**](?path=/docs/data-providers--overview).
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
                story: `\`pinned\` keeps *Product* left and *Category* right, and \`maxWidth\` keeps *Photo* narrow. Try: turn *Show every column* off to see the rest stretch.`,
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
                story: `\`context.isPrimary\` makes *Product* a link, and \`onOpenRecord\` opens the product in a form in a panel. Try: click a name, change the product and save it from the panel's ribbon.`,
            },
        },
    },
}

export const WorkOutTheStockValue: Story = {
    name: 'Calculate the stock value',
    render: () => renderStory(<StockValueExample />),
    parameters: {
        docs: {
            description: {
                story: `*Stock value* is *Price* × *In stock*, calculated in a column of its own. Try: change either value and watch it follow.`,
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
                story: `\`onGetCommands\` adds *Reorder* to low-stock products, and *Copy SKU* and *Discontinue* to the **…** menu. Try: hover a row.`,
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
                story: `\`onGetAdornments\` adds a low-stock badge, and \`onGetMenuSections\` adds quick filters. Try: open the *In stock* menu.`,
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
                story: `*Notes* wrap and can be dragged taller, while *Next step* stays on one line with \`isRowResizable: false\`. Try: drag a row's bottom edge.`,
            },
        },
    },
}

export const FitRowsToTheirNotes: Story = {
    name: 'Fit rows to their notes',
    render: () => renderStory(<AutoHeightExample />),
    parameters: {
        docs: {
            description: {
                story: `\`autoHeight: true\` on *Notes* makes every row as tall as its note, up to six lines. Try: shorten a note.`,
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
                story: `The control's \`stateKey\` keeps the widths and the order. Try: resize or move a column, then reopen the list.`,
            },
        },
    },
}
