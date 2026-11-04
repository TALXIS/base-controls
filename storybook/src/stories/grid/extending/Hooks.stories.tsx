import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { AssignToMeExample, ColumnsByRoleExample, CopyColumnExample, CurrencyInHeaderExample, DayUnderTenHoursExample, LockClosedDealsExample, PlaceholdersExample, RefreshPricesExample, UrgentRowsExample } from '../../../grid/examples/hooksExamples'

const DESCRIPTION = `
A hook lets your code change a decision the grid makes as it draws: a cell's colour, whether it can be edited, whether a value is valid, what a column's menu offers. Registered in a module, a rule of your business, such as locking the numbers of a closed deal, becomes part of the grid. Try it below: set a deal's *Stage* to Won.

{{canvas: Lock the cells of closed deals}}

## How hooks run

Register a hook on a service in a module's \`onLoad\`, and change the result it receives. What it returns is ignored. How to write a module is on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview).

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

\`registerValidation\` sets \`result.error\` and \`result.errorMessage\` for a value. An error marks the cell and refuses the record's save, on top of the built-in checks: see *Validation* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview).

{{story: Keep a day under ten hours}}

The hook runs for every column of every record, so check \`columnName\` first. A rule that reads other records changes whenever one of them does, so redraw the cells with \`cells.render()\`, as this module does.

## Cells

\`registerCellLoading\` draws a shimmer in place of a cell's value while \`result.isLoading\` is set.

{{story: Refresh prices from a supplier}}

\`registerCellCommands\` adds commands to a cell: push to \`result.items\` for buttons and to \`result.overflowItems\` for the **…** menu. How they are drawn is under *Add cell commands* on [**Columns**](?path=/docs/controls-grid-columns--overview).

{{story: Assign new tickets to yourself}}

\`registerControlParameters\` changes what a cell's control receives, such as its \`Placeholder\`. The parameters \`GridValueRenderer\` reads are under *Control parameters* on [**Columns**](?path=/docs/controls-grid-columns--overview). \`takesInput\` is \`true\` for an editor and for an in-place cell.

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

Every header hook receives an \`IGridColumnHeader\`:

- \`getColumn()\` is the provider's column, \`undefined\` for a column you added, and \`getColDef()\` its column definition.
- \`getName()\`, \`getTitle()\`, \`getContext()\` and \`getAlignment()\` read what the header shows.
- \`isRequired()\`, \`getAdornments()\` and \`getMenuItems()\` read what it draws.
- \`getElement()\`, \`openMenu()\` and \`closeMenu()\` reach its element and menu.

\`registerColumnHeaderAdornments\` draws \`{ key, placement, title?, onRender? }\` beside the column's name. After the name, the modules add the lock of a locked column (\`'lock'\`, editing), the sort arrow, the filter funnel and the total's title; before it, the group icon. At the default priority, yours come first on the same side.

{{story: Show the currency in the header}}

## Reference

### Every hook

| Hook | On | Decides | Runs last |
|---|---|---|---|
| \`registerCellTheme\` | \`cells\` | A cell's colours, through \`builder\`: see *Colour cells by their data* on [**Appearance**](?path=/docs/controls-grid-appearance--overview) | \`context.cell.onGetTheme\` |
| \`registerCellLoading\` | \`cells\` | \`result.isLoading\` | \`context.cell.onGetLoading\` |
| \`registerCellCommands\` | \`cells\` | \`result.items\`, \`result.overflowItems\` | \`context.cell.onGetCommands\` |
| \`registerControl\` | \`cells\` | \`result.control\`: the control that draws a cell, and its \`bindings\` | None |
| \`registerControlParameters\` | \`cells\` | The parameters a cell's control receives | \`context.cell.onGetControlParameters\` |
| \`registerRowHeight\` | \`rows\` | \`result.height\`, in pixels | \`rowSettings.onGetHeight\` |
| \`registerRowClass(className, rule)\` | \`rows\` | Whether a row takes the class; no priority | None |
| \`registerLock\` | \`editing.locks\` | \`result.isLocked\` for a column, a row or a cell | \`rowSettings.onGetLock\`, \`context.cell.onGetLock\` |
| \`registerValidation\` | \`validation\` | \`result.error\`, \`result.errorMessage\` | \`context.cell.onGetValidation\` |
| \`registerColumnDefinitions\` | \`columns\` | The column definitions AG Grid receives | \`colDefs\` |
| \`registerColumnMenuSection\` | \`columns.headers\` | A menu's sections | \`context.header.onGetMenuSections\` |
| \`registerColumnMenuItems\` | \`columns.headers\` | A menu's final items | \`context.header.onGetMenuItems\` |
| \`registerColumnHeaderAdornments\` | \`columns.headers\` | What a header draws beside the name | \`context.header.onGetAdornments\` |
| \`registerColumnHeaderTheme\` | \`columns.headers\` | A header's colours, through \`builder\` | \`context.header.onGetTheme\` |
| \`registerSurface\` | \`surfaces\` | What modules draw inside the grid: see [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview) | None |
| \`registerFilterControlParameters\` | \`filtering\` | The parameters of the filter callout's controls | None |
| \`registerSelectRecords\` | \`rowSelection\` | \`selection.recordIds\` or \`selection.isCancelled\`; may be async | None |
| \`registerSelectionState\` | \`rowSelection\` | \`result.state\` of a row's checkbox | None |
| \`onKeyDown(handler)\` | \`keyboard\` | Runs for every key pressed inside the grid; no priority | None |
| \`registerAgGridOptions\`, \`registerAgGridInitialOptions\` | The grid | AG Grid's options: see [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview) | None |
| \`registerTheme\`, \`registerStyles\` | \`gridTheme\` | The AG Grid theme and the root element's styles | None |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-extending-write-a-module--overview', text: 'Package your hooks in a module, with state and UI of its own.' },
    { title: 'Talking to the grid', iconName: 'Plug', href: '?path=/docs/controls-grid-talking-to-the-grid--overview', text: 'The services the hooks live on, and how to redraw after a change.' },
    { title: 'AG Grid', iconName: 'Settings', href: '?path=/docs/controls-grid-extending-ag-grid--overview', text: 'Set AG Grid\'s own options for what no hook covers.' },
]

const meta = {
    title: 'Controls/Grid/Extending/Hooks',
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

export const LockTheCellsOfClosedDeals: Story = {
    name: 'Lock the cells of closed deals',
    render: () => renderStory(<LockClosedDealsExample />),
}

export const KeepADayUnderTenHours: Story = {
    name: 'Keep a day under ten hours',
    render: () => renderStory(<DayUnderTenHoursExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerValidation\` caps each employee's day at ten hours, and \`cells.render()\` redraws the day's other entries. Try: cut one of Anna Novak's Monday entries.`,
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
                story: `\`registerCellLoading\` draws a shimmer in each *Price* cell until the supplier returns that price. Try: press *Refresh prices*.`,
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
                story: `\`registerControlParameters\` gives the *Assigned to* and *Customer* cells and editors a \`Placeholder\` in place of \`---\`. Try: clear a ticket's *Customer*.`,
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
                story: `\`registerRowHeight\` makes every High priority row 64px tall, and \`resetRowHeights()\` measures again when a priority changes. Try: change a ticket's *Priority* to High.`,
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
                story: `\`registerColumnDefinitions\` hides *Hourly rate* unless a project manager is signed in. Try: switch to Project manager.`,
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
                story: `\`registerColumnMenuSection\` adds *Copy column values* to every column's menu, below the modules' sections. Try: copy the *Deal* column from its menu.`,
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
                story: `\`registerColumnHeaderAdornments\` draws USD after the name of every currency column, and its \`title\` joins the header's tooltip. Try: sort by *Price*.`,
            },
        },
    },
}
