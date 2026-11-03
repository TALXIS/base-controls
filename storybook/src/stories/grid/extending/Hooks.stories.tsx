import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { AssignToMeExample, ColumnsByRoleExample, CopyColumnExample, CurrencyInHeaderExample, DayUnderTenHoursExample, LockClosedDealsExample, PlaceholdersExample, RefreshPricesExample, UrgentRowsExample } from '../../../grid/examples/hooksExamples'

const DESCRIPTION = `
A grid hook changes one decision the grid makes: a cell's colour, a lock, a validation rule, a column's menu. Register it on a service in a module's \`onLoad\`, and change the result it receives. What it returns is ignored. How to write a module is on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview).

{{story: Lock the cells of closed deals}}

## How hooks run

The grid runs the hooks each time it draws, so keep a hook fast and free of side effects. When something a hook reads changes, see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). Every \`register…\` call takes an optional \`priority\` and returns a function that removes the hook.

Hooks of one kind run in ascending priority. Within one priority they run in the order they were registered, which follows the order of the \`modules\` array. The default priority is \`0\`, which runs before every built-in module except the legacy client API's, so a module that sets the same thing later overwrites yours. To run after module *x*, register at \`GRID_MODULE_PRIORITY.x + 1\`:

| Module | \`GRID_MODULE_PRIORITY\` |
|---|---|
| \`legacyClientApiCompatibility\` | \`0\` |
| \`rowModel\` | \`10\` |
| \`editing\` | \`15\` |
| \`rowSelection\` | \`20\` |
| \`cellSelection\` | \`30\` |
| \`sorting\`, \`filtering\` | \`40\`, \`50\` |
| \`grouping\`, \`aggregation\` | \`60\`, \`70\` |
| \`clipboard\` | \`80\` |

The column's and the row's own callbacks, set through \`colDefs\` and \`rowSettings\`, run after every hook of their kind, and \`colDefs\` runs after every column definitions hook. Hooks run for group rows and the totals row too: see *Summary rows* on [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview).

## Locks

One lock hook decides three levels. The context it receives says which one the grid is asking about:

| Level | Context |
|---|---|
| A column | \`{ columnName }\` |
| A record's row | \`{ record }\` |
| A cell | \`{ record, columnName }\` |

Check the context before you read it. A hook that reads \`record\` without checking fails for a column, and a hook that ignores the context locks every column and every row. How each level is drawn is under *Locks* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview).

## Validation

\`registerValidation\` sets \`result.error\` and \`result.errorMessage\` for a value. An error outlines the cell and refuses the record's save, on top of the built-in checks: see *Validation* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview).

{{story: Keep a day under ten hours}}

The hook runs for every column of every record, so check \`columnName\` first. A rule that reads other records changes whenever one of them does, so redraw the cells with \`cells.render()\`, as this module does.

## Cells

\`registerCellLoading\` draws a shimmer in place of a cell's value while \`result.isLoading\` is set.

{{story: Refresh prices from a supplier}}

\`registerCellCommands\` adds commands to a cell: push to \`result.items\` for buttons and to \`result.overflowItems\` for the **…** menu. How they are drawn is under *Add cell commands* on [**Columns**](?path=/docs/controls-grid-columns--overview).

{{story: Assign new tickets to yourself}}

\`registerControlParameters\` changes what a cell's control receives, such as its \`Placeholder\`. The parameters the value renderer reads are under *Control parameters* on [**Columns**](?path=/docs/controls-grid-columns--overview). \`takesInput\` is \`true\` for an editor and for a one-click cell.

{{story: Show placeholders for missing values}}

## Rows

\`registerRowHeight\` sets a row's height in pixels on \`result.height\`; leave it unset for the grid's \`rowHeight\`.

{{story: Make urgent tickets taller}}

\`rowSettings.onGetHeight\` runs after the hooks, and a height the user drags on a row's resize grip wins over both. AG Grid asks for a row's height when it lays the row out, so after a change that should resize rows, call \`resetRowHeights()\` on the \`gridApi\` service.

\`registerRowClass(className, rule)\` puts a class on every row whose record the rule holds for, such as the editing module's \`LOCKED_RECORD_ROW_CLASS\` on a locked record. Pinned rows never take it. AG Grid runs the rules when it updates a row, so call \`rows.refreshRowClasses(records)\` after a change.

## Columns

\`registerColumnDefinitions\` receives the column definitions built so far and can change, add, remove or reorder them.

{{story: Show columns by role}}

It receives one definition per provider column that is not hidden, with the column's name as \`colId\`, plus what earlier hooks added, such as the save and lock columns and the checkbox column. Read a definition's \`context\` with \`getColumnContext(colDef)\`. A column you add takes the grid's header, and draws an empty cell unless you give it a \`cellRenderer\`.

It runs when the grid is ready and on every load of the provider, so a change to what it reads shows after \`provider.refresh()\`. At the default priority the modules can overwrite what it sets: sorting sets \`sortable\` on every provider column, and grouping pins grouped columns and moves them first. \`GRID_MODULE_PRIORITY.clipboard + 1\` runs after every built-in module.

## Headers

\`registerColumnMenuSection\` adds sections to a column's menu, each \`{ key, title, items }\`. The built-in sections are \`'sorting'\`, \`'filtering'\`, \`'grouping'\` and \`'aggregation'\`, so a section at the default priority comes above them.

{{story: Copy a column's values}}

\`registerColumnMenuItems\` runs after the sections are laid out and receives every item, each section's heading included, keyed \`'<section key>Header'\`. Use it to move or remove what a section cannot.

Every header hook receives an \`IGridColumnHeader\`. \`getColumn()\` is the provider's column, \`undefined\` for a column you added; \`getColDef()\`, \`getName()\`, \`getTitle()\`, \`getContext()\`, \`getAlignment()\`, \`isRequired()\`, \`getAdornments()\`, \`getMenuItems()\`, \`getElement()\`, \`openMenu()\` and \`closeMenu()\` read and drive the rest.

\`registerColumnHeaderAdornments\` draws \`{ key, placement, title?, onRender? }\` beside the column's name. After the name, the modules add the lock of a locked column (\`'lock'\`, editing), the sort arrow, the filter funnel and the total's title; before it, the group icon. At the default priority, yours come first on the same side.

{{story: Show the currency in the header}}

## Every hook

| Service | Hook | Decides | Receives | Runs last |
|---|---|---|---|---|
| \`cells\` | \`registerCellTheme\` | A cell's colours: see *Colour cells by their data* on [**Appearance**](?path=/docs/controls-grid-appearance--overview) | \`builder: ThemeBuilder\`, \`{ record, columnName }\` | \`context.cell.onGetTheme\` |
| \`cells\` | \`registerCellLoading\` | Whether a cell draws a shimmer: \`result.isLoading\` | \`result: IGridCellLoading\`, \`{ record, columnName }\` | \`context.cell.onGetLoading\` |
| \`cells\` | \`registerCellCommands\` | A cell's commands: \`result.items\`, \`result.overflowItems\` | \`result: IGridCellCommands\`, \`{ record, columnName }\` | \`context.cell.onGetCommands\` |
| \`cells\` | \`registerControl\` | Which control draws a cell: \`result.control.name\` and its \`bindings\` | \`result: { control }\`, \`{ record, columnName, takesInput }\` | None |
| \`cells\` | \`registerControlParameters\` | The parameters a cell's control receives | \`result: IParameters\`, \`{ record, columnName, takesInput }\` | \`context.cell.onGetControlParameters\` |
| \`rows\` | \`registerRowHeight\` | A row's height, in pixels: \`result.height\` | \`result: IGridRowHeight\`, \`{ record, node }\` | \`rowSettings.onGetHeight\` |
| \`rows\` | \`registerRowClass(className, rule)\` | Whether a row takes the class: the rule returns \`true\`. Takes no priority | \`{ record, node }\` | None |
| \`editing.locks\` | \`registerLock\` | Whether a column, a row or a cell is locked: \`result.isLocked\` | \`result: IGridLock\`, \`{ record?, columnName? }\` | \`rowSettings.onGetLock\`, \`context.cell.onGetLock\` |
| \`validation\` | \`registerValidation\` | Whether a value is valid: \`result.error\`, \`result.errorMessage\` | \`result: IFieldValidationResult\`, \`{ record, columnName }\` | \`context.cell.onGetValidation\` |
| \`columns\` | \`registerColumnDefinitions\` | The column definitions AG Grid receives | \`columnDefs: ColDef<IRecord>[]\` | \`colDefs\` |
| \`columns.headers\` | \`registerColumnMenuSection\` | The sections of a column's menu | \`sections: IColumnMenuSection[]\`, \`header: IGridColumnHeader\` | \`context.header.onGetMenuSections\` |
| \`columns.headers\` | \`registerColumnMenuItems\` | The menu's final items, headings included | \`items: IContextualMenuItem[]\`, \`header\` | \`context.header.onGetMenuItems\` |
| \`columns.headers\` | \`registerColumnHeaderAdornments\` | What a header draws beside the column's name | \`adornments: IColumnHeaderAdornment[]\`, \`header\` | \`context.header.onGetAdornments\` |
| \`columns.headers\` | \`registerColumnHeaderTheme\` | A header's colours | \`builder: ThemeBuilder\`, \`header\` | \`context.header.onGetTheme\` |
| \`surfaces\` | \`registerSurface\` | What modules draw inside the grid, after the rows: push \`{ key, onRender }\` | \`surfaces: IGridSurface[]\` | None |
| \`filtering\` | \`registerFilterControlParameters\` | The parameters of the filter callout's controls | \`result: IParameters\`, \`{ column, control, index }\` | None |
| \`rowSelection\` | \`registerSelectRecords\` | The records about to be selected: change \`selection.recordIds\`, or set \`selection.isCancelled\`. May be async; each is awaited in turn | \`selection\`, \`{ provider }\` | None |
| \`rowSelection\` | \`registerSelectionState\` | How a row's checkbox reads: \`result.state\` is \`'checked'\`, \`'unchecked'\` or \`'indeterminate'\` | \`result\`, \`{ record, node }\` | None |
| \`keyboard\` | \`onKeyDown(handler)\` | Runs for every key pressed inside the grid, before what it lands in. Takes no priority | \`event: KeyboardEvent\` | None |
| The grid | \`registerAgGridOptions\`, \`registerAgGridInitialOptions\` | AG Grid's options: see [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview) | \`result: { options }\` | None |
| \`gridTheme\` | \`registerTheme\`, \`registerStyles\` | The AG Grid theme and the root element's styles: see *The AG Grid theme* on [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview) | \`result\`, \`fluentTheme\` | None |
`

const meta = {
    title: 'Controls/Grid/Extending/Hooks',
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

export const LockTheCellsOfClosedDeals: Story = {
    name: 'Lock the cells of closed deals',
    render: () => renderStory(<LockClosedDealsExample />),
    parameters: {
        docs: {
            description: {
                story: `A won or lost deal keeps its numbers: \`registerLock\`, asked about a cell, locks Products, Value, Probability and Close date once a deal is closed, and the \`grid.valueLocked\` label, set through \`LabelsProvider\`, says why. Try: set a deal's Stage to Won; its numbers lock and Stage stays open.`,
            },
        },
    },
}

export const KeepADayUnderTenHours: Story = {
    name: 'Keep a day under ten hours',
    render: () => renderStory(<DayUnderTenHoursExample />),
    parameters: {
        docs: {
            description: {
                story: `Payroll caps a consultant's day at ten hours: \`registerValidation\` adds up every entry of the same employee on the same day, and \`cells.render()\` redraws the day's other entries. Try: cut one of Anna Novak's Monday entries until the day is back to ten.`,
            },
        },
    },
}

export const RefreshPricesFromASupplier: Story = {
    name: 'Refresh prices from a supplier',
    render: () => renderStory(<RefreshPricesExample />),
    parameters: {
        docs: {
            description: {
                story: `Prices come from a supplier one product at a time: \`registerCellLoading\` draws a shimmer in each Price cell until that product's price is back. Try: press *Refresh prices*.`,
            },
        },
    },
}

export const AssignNewTicketsToYourself: Story = {
    name: 'Assign new tickets to yourself',
    render: () => renderStory(<AssignToMeExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerCellCommands\` offers *Assign to me* in the Assigned to cell of every unassigned ticket. Try: hover a New ticket and pick *Assign to me*.`,
            },
        },
    },
}

export const PlaceholdersForMissingValues: Story = {
    name: 'Show placeholders for missing values',
    render: () => renderStory(<PlaceholdersExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerControlParameters\` gives the Assigned to and Customer cells a \`Placeholder\` in place of \`---\`, and their editors get it too. Try: clear a ticket's Customer to see No customer.`,
            },
        },
    },
}

export const TallerRowsForUrgentTickets: Story = {
    name: 'Make urgent tickets taller',
    render: () => renderStory(<UrgentRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerRowHeight\` makes every High priority row 64px tall, and \`resetRowHeights()\` makes AG Grid measure again when a priority changes. Try: change a ticket's Priority to High, or back to Normal.`,
            },
        },
    },
}

export const ColumnsByRole: Story = {
    name: 'Show columns by role',
    render: () => renderStory(<ColumnsByRoleExample />),
    parameters: {
        docs: {
            description: {
                story: `Consultants log their hours without seeing the billing rate: \`registerColumnDefinitions\` hides Hourly rate unless a project manager is signed in. Try: switch to Project manager; \`provider.refresh()\` builds the columns again.`,
            },
        },
    },
}

export const CopyAColumnsValues: Story = {
    name: "Copy a column's values",
    render: () => renderStory(<CopyColumnExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerColumnMenuSection\` adds a Column section with *Copy column values* to every column's menu, below the modules' sections at \`GRID_MODULE_PRIORITY.aggregation + 1\`. Try: copy the Deal column from its menu.`,
            },
        },
    },
}

export const ShowTheCurrencyInTheHeader: Story = {
    name: 'Show the currency in the header',
    render: () => renderStory(<CurrencyInHeaderExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerColumnHeaderAdornments\` draws USD after the name of every currency column, and its \`title\` joins the header's tooltip. Try: hover the Price header, then sort by it; USD stays ahead of the arrow.`,
            },
        },
    },
}
