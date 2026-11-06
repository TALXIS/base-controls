import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { AutoHeightExample, HeaderExample, KeyColumnsExample, LongNotesExample, ProductLinkExample, RememberLayoutExample, RowCommandsExample, StockValueExample } from '../../grid/examples/columnsExamples'

const DESCRIPTION = `
The grid builds a column for each of the provider's columns, with its header text, width and data type. \`colDefs\` changes those columns, or adds columns of your own, without touching the provider: key columns that stay in view, a link to the record, a calculated value or a button on every row. Try it below: turn off *Show every column*.

{{canvas: Keep key columns in view}}

## Change a column

\`colDefs\` is keyed by column id. An entry takes any AG Grid column definition key, plus \`context\` for what the grid itself reads (see *The column context* below), and is merged over the column as built, \`context.cell\` and \`context.header\` included, so you change only what you set. A function entry receives the column as built, \`null\` for one you add, and returns what to change. \`colDefs\` applies after every module, so it overrides what they set.

| Key | Column |
|---|---|
| A provider column's \`name\` | That column. What the grid reads from the provider's columns is on [**Data**](?path=/docs/controls-grid-data--overview) |
| \`RECORD_SAVE_COLUMN_KEY\`, \`RECORD_LOCK_COLUMN_KEY\` | The editing module's save status and lock columns |
| \`SELECTION_COLUMN_KEY\` | The row selection module's checkbox column |
| \`GROUP_EXPANSION_COLUMN_KEY\` | The grouping module's expansion column |
| Any other key | A column of your own, added at the end: see *Add a calculated column* |

Keys of your own in \`context\` sit beside the grid's, and \`getColumnContext(colDef)\` reads them back, such as in a cell of your own.

## Pin and size columns

\`pinned: 'left'\` or \`'right'\` keeps a column at that edge, as in the example above. A column's width comes from its provider column's \`visualSizeFactor\`, or \`initialWidth\` in \`colDefs\`; columns stretch to fill the grid, and \`maxWidth\` caps one.

## Link to the record

\`context.isPrimary: true\` draws the value as a link to its record. Clicking it, or double-clicking a row in a grid without the editing module, opens the record; pass \`onOpenRecord\` to \`<Grid />\` to do something else. \`enableNavigation={false}\` turns links and opening off.

{{story: Open a product from its name}}

## Add a calculated column

Give \`colDefs\` a key that is not a provider column. \`valueGetter\` returns the value, which copying uses too, and \`cellRenderer\` draws the cell (see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview)); without a \`cellRenderer\` the cell is empty. Read the record with \`useGridCell()\` inside the cell, so the value follows the record.

The column takes the grid's header and keeps its \`initialWidth\`. It has no editor, the modules add nothing to its menu, and the column layout does not keep it. Group rows and the totals row draw it too: see *Summary rows* on [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview).

{{story: Calculate the stock value}}

## Add cell commands

\`context.cell.commandsHook(result, { record })\` adds commands to the column's cells. They show while the row is hovered, focused or selected, and are asked for each time, so they can depend on the record. Push \`ICommandBarItemProps\` to \`result.items\` for buttons, or to \`result.overflowItems\` for the **…** menu. Give each a \`text\`; \`iconOnly: true\` shows just the icon.

{{story: Reorder from the row}}

## Extend the header

Clicking a header opens its menu. \`context.header\` adds to the header and its menu:

| Callback | Does |
|---|---|
| \`adornmentsHook(adornments)\` | Push \`{ key, placement: 'prefix' \\| 'suffix', title?, onRender? }\` to draw beside the name. |
| \`menuSectionsHook(sections)\` | Push \`{ key, title, items }\`, or remove a module's section by its key. |
| \`menuItemsHook(items)\` | Change the final menu items. |
| \`themeHook(builder)\` | Colour the header. See *Colour column headers* on [**Appearance**](?path=/docs/controls-grid-appearance--overview). |

The menu is built each time it opens, and adornments each time the header draws. After a change the header should show, see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

{{story: Flag low stock in the header}}

## Show long text

Multiline text and text area columns wrap, up to six lines, with the full text in the tooltip. Users can drag a row taller by the grip on a cell's bottom edge; \`context.cell.isRowResizable\` turns the grip on or off for any column.

{{story: Read long notes}}

To size rows to the text instead, set AG Grid's \`autoHeight: true\` on the column: each row grows to fit its text, still up to six lines.

{{story: Fit rows to their notes}}

## Remember the layout

The widths, order and visibility of the columns live on the provider's columns. Inside a DatasetControl with a \`stateKey\`, the control keeps them per view: see the DatasetControl's [**State**](?path=/docs/controls-datasetcontrol-state--overview).

{{story: Remember the layout}}

Columns added through \`colDefs\` are not kept. A grid outside a DatasetControl keeps nothing: save each column's \`name\`, \`visualSizeFactor\` and \`order\` in \`onColumnsChanged(columns)\`, and apply them with \`setColumns()\` before the provider loads.

## Reference

### The column context

What the grid reads from a column's \`context\`. The \`cell\` and \`header\` callbacks run after the hooks of their kind on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview), so a column overrides them.

| Key | Type | Description |
|---|---|---|
| \`isPrimary\` | \`boolean\` | Draws the value as a link to the record. |
| \`isRequired\` | \`boolean\` | Draws the required marker in the header; the editing module sets it from \`RequiredLevel\`. Validates nothing. |
| \`isLocked\` | \`boolean\` | With editing, locks the column for good; defaults to \`!IsValidForUpdate\`. See *Locks* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). |
| \`alignment\` | \`'left' \\| 'center' \\| 'right'\` | Which edge the value reads from; numbers and currency default to \`'right'\`. |
| \`widthOffset\` | \`number\` | Pixels added for what a module draws in the column, such as grouping's indent. Not saved. |
| \`cell.isRowResizable\` | \`boolean\` | Draws the grip a row is dragged taller by. |
| \`cell.enableOneClickEdit\` | \`boolean\` | With editing, draws the editing control in the cell. See *Edit in place* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). |
| \`cell.commandsHook\` | \`(result, { record }) => void\` | The cell's commands. See *Add cell commands*. |
| \`cell.themeHook\` | \`(builder, { record }) => void\` | The cell's colours. See *Colour cells by their data* on [**Appearance**](?path=/docs/controls-grid-appearance--overview). |
| \`cell.loadingHook\` | \`(result, { record }) => void\` | Draws a shimmer in place of the value while \`result.isLoading\`. |
| \`cell.lockHook\` | \`(result, { record }) => void\` | With editing, locks the cell. See *Locks* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). |
| \`cell.validationHook\` | \`(result, { record }) => void\` | Marks the value invalid. See *Validation* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). |
| \`cell.controlParametersHook\` | \`(parameters, { record }) => void\` | The parameters the cell's control receives. See *Control parameters*. |
| \`header.adornmentsHook\`, \`menuSectionsHook\`, \`menuItemsHook\`, \`themeHook\` | Callbacks | See *Extend the header*. |

### Control parameters

\`cell.controlParametersHook\`, and the \`addControlParametersHook\` hook, change what a cell's control receives. Each parameter is an object with a \`raw\` value, such as \`{ raw: 'Unassigned' }\`. A cell that only shows its value is drawn by \`GridValueRenderer\`, which reads these:

| Parameter | Description |
|---|---|
| \`Placeholder\` | The text an empty cell shows. Default \`---\`. |
| \`PrefixIcon\`, \`SuffixIcon\` | The name of a Fluent icon drawn before or after the value. |
| \`IsPrimaryColumn\` | \`true\`, with \`EnableNavigation\` also \`true\`, draws the value as a link that opens the record. |
| \`EnableNavigation\` | \`false\` draws emails, phones, URLs, lookups and the primary column as plain text. |
| \`EnableOptionSetColors\` | \`true\` draws options that have a colour as tags. |
| \`IsMultiline\` | \`true\` wraps the text onto the lines its row has room for, up to six. |
| \`ColumnAlignment\` | \`'left'\`, \`'center'\` or \`'right'\`. |

An editor, and a cell drawn with \`enableOneClickEdit\`, is drawn by the column's editing control, which takes that control's own parameters; the text field reads \`Placeholder\` too. \`GridValueRenderer\` reads the value from the record, so changing \`value\` here shows nothing.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Custom cells', iconName: 'TableComputed', href: '?path=/docs/controls-grid-appearance-custom-cells--overview', text: 'Redraw a column\'s cells, or lay a cell out from its parts.' },
    { title: 'Appearance', iconName: 'Color', href: '?path=/docs/controls-grid-appearance--overview', text: 'Colour cells and headers by their data, and size the grid.' },
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Change what every column draws and decides from a module.' },
]

const meta = {
    title: 'Controls/Grid/Columns',
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

export const KeepKeyColumnsInView: Story = {
    name: 'Keep key columns in view',
    render: () => renderStory(<KeyColumnsExample />),
}

export const OpenAProductFromItsName: Story = {
    name: 'Open a product from its name',
    render: () => renderStory(<ProductLinkExample />),
    parameters: {
        docs: {
            description: {
                story: `\`context.isPrimary\` makes *Product* a link, and \`onOpenRecord\` opens the product in a form in a panel. Try: click a product's name.`,
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
                story: `*Stock value* is *Price* × *In stock*, calculated in a column of its own. Try: double-click a price and change it.`,
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
                story: `\`commandsHook\` adds *Reorder* to low-stock products, and *Copy SKU* and *Discontinue* to the **…** menu. Try: hover a row.`,
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
                story: `\`adornmentsHook\` adds a low-stock badge, and \`menuSectionsHook\` adds quick filters. Try: open the *In stock* menu.`,
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
                story: `\`autoHeight: true\` on *Notes* makes every row as tall as its note, up to six lines. Try: open **Code** and remove \`autoHeight\`.`,
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
                story: `The control's \`stateKey\` keeps the widths and the order. Try: move a column, then press *Reopen the list*.`,
            },
        },
    },
}
