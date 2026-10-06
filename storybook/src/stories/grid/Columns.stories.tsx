import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import {
    AutoHeightExample, HeaderExample, KeyColumnsExample, LongNotesExample, ProductLinkExample, RememberLayoutExample, RowCommandsExample, StockValueExample,
} from '../../grid/examples/columnsExamples'

const DESCRIPTION = `
Every provider column becomes a grid column. \`colDefs\` changes them and adds your own. The examples use an office furniture shop's products.

## Changing a column

\`colDefs\` is keyed by column id, which is the provider column's \`name\`. An entry takes any AG Grid column definition key plus the grid's \`settings\`.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{
        name: { pinned: 'left', settings: { isPrimary: true } },
        price: colDef => ({ headerName: colDef?.headerName + ' (excl. VAT)' }),
        stockvalue: { headerName: 'Stock value', initialWidth: 130, cellRenderer: StockValueCell },
    }} />
\`\`\`

- An entry for an existing column is merged over it, including \`settings\`, \`settings.cell\` and \`settings.header\`, so you change only what you set. Any other key adds a column at the end.
- A function entry gets the column as built (\`null\` for an added one) and returns what to change.
- \`colDefs\` is applied after every module, so it has the last word.
- The grid's own columns are reachable by their keys: \`RECORD_SAVE_COLUMN_KEY\`, \`RECORD_LOCK_COLUMN_KEY\`, \`SELECTION_COLUMN_KEY\` and \`GROUP_EXPANSION_COLUMN_KEY\`.

### Pinning

\`pinned: 'left'\` or \`'right'\` keeps a column at that edge.

### Widths

A column's width comes from its \`visualSizeFactor\`, or \`initialWidth\` in \`colDefs\`. Columns stretch to fill the grid; cap one with \`maxWidth\`.

{{story: Keep key columns in view}}

## Navigation

- \`settings.isPrimary: true\` draws the value as a link to its record.
- Clicking it, or double-clicking a row without editing, opens the record. Pass \`onOpenRecord\` to \`<Grid.Root />\` to do something else.
- \`enableNavigation={false}\` turns links and opening off.

{{story: Open a product from its name}}

## Calculated columns

Add a column by giving \`colDefs\` a key that isn't a provider column, then work its value out from the record:

- \`valueGetter\` returns the value. Copying uses it too.
- \`cellRenderer\` draws the cell. Use \`Grid.Cell.Renderer\` and replace what it draws through \`components\`, or build your own cell from \`Grid.Cell.Root\`, \`Theme\`, \`Container\` and \`Control\` as the example below does. See [**Custom cells**](?path=/docs/grid-appearance-custom-cells--overview) for both.
- Read the record with \`useGridCell()\` inside the cell, so the value updates when the record changes.
- The column is placed last and keeps its \`initialWidth\`. It has no menu or editor, and isn't saved with the layout.
- Group and totals rows draw it too, so draw nothing when \`record.getDataProvider().getSummarizationType() !== 'none'\`.

{{story: Work out the stock value}}

## Cell commands

\`settings.cell.onGetCommands(result, { record })\` adds commands to the column's cells.

- Push \`ICommandBarItemProps\` to \`result.items\` for buttons, or to \`result.overflowItems\` for the menu. Give each a \`text\`; \`iconOnly: true\` shows just the icon.
- Commands show while the row is hovered, focused or selected, and are worked out each time, so they can depend on the record.

{{story: Reorder from the row}}

## The header

Clicking a header opens its menu. \`settings.header\` adds to it:

- \`onGetAdornments(adornments)\`: push \`{ key, placement: 'prefix' | 'suffix', title?, onRender? }\` to draw beside the name.
- \`onGetMenuSections(sections)\`: push \`{ key, title, items }\`, or remove a module's section by key.
- \`onGetMenuItems(items)\`: change the final menu items.
- \`onGetTheme(theme)\`: colour the header (see [**Appearance**](?path=/docs/grid-appearance--overview)).

The menu is worked out when it opens; adornments when the header draws. Call \`runtime.services.get('columns').headers.render()\` after a change the header should reflect.

{{story: Flag low stock in the header}}

## Multiline content

- Multiline text and text area columns wrap, up to six lines. The full text is in the tooltip.
- Users can drag a row taller by the grip on a cell's bottom edge.
- \`settings.cell.isRowResizable\` turns this on or off for any column.

{{story: Read long notes}}

To size rows to the text instead, set AG Grid's \`autoHeight: true\` in \`colDefs\`: each row grows to fit the column's text, still up to six lines.

{{story: Fit rows to their notes}}

## Remembering the layout (WIP)

> **Work in progress.** How the layout is remembered will change along with the grid's \`state\`.

\`onColumnsChanged(columns)\` fires after the user resizes or moves a column, with the provider's columns updated (\`visualSizeFactor\` and \`order\`).

- Save each column's \`name\`, \`visualSizeFactor\` and \`order\`, and apply them with \`setColumns()\` before the provider's first \`refresh()\`.
- Columns added through \`colDefs\` are not included.
- Don't use the \`state\` prop for this: the grid lays the columns out again from the provider.

{{story: Remember the layout}}
`

const meta = {
    title: 'Grid/Columns/Overview',
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
                story: `\`pinned\` keeps Product left and Category right, and \`maxWidth\` keeps Photo narrow. Turn *Show every column* off to see the rest stretch.`,
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
                story: `\`settings.isPrimary\` makes Product a link, and \`onOpenRecord\` opens the product in a form in a panel, saved from its ribbon. Click a name.`,
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
                story: `Stock value is calculated as Price × In stock. Change either and it follows.`,
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
                story: `\`onGetCommands\` adds Reorder to low-stock products, and Copy SKU and Discontinue to the menu. Hover a row.`,
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
                story: `\`onGetAdornments\` adds a low-stock badge and \`onGetMenuSections\` adds quick filters. Open the In stock menu.`,
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
                story: `Notes wrap and can be dragged taller; Next step stays on one line with \`isRowResizable: false\`.`,
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
                story: `\`autoHeight: true\` on Notes makes every row as tall as its note, up to six lines.`,
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
                story: `\`onColumnsChanged\` saves widths and order. Resize or move a column, then reopen the list.`,
            },
        },
    },
}
