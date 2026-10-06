import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { AssignToMeExample, ColumnsByRoleExample, CopyColumnExample, CurrencyInHeaderExample, DayUnderTenHoursExample, LockClosedDealsExample, PlaceholdersExample, RefreshPricesExample, UrgentRowsExample } from '../../../grid/examples/hooksExamples'

const DESCRIPTION = `
A hook changes one decision the grid makes. Register it on a service in a module's \`onRegister\`, pass the module in \`modules.custom\`, and change the result the hook is handed: what it returns is ignored. Each example below is a small module that solves one problem. Every hook, what it is handed, the order hooks run in and how to make the grid ask again are on [**Extending**](?path=/docs/grid-extending--overview).

- The grid asks again each time it draws, so keep a hook fast and free of side effects.
- A hook runs at priority \`0\` unless you pass one, which is before every built-in module but the legacy client API one: see *Priorities* on [**Extending**](?path=/docs/grid-extending--overview).
- Hooks run for group rows and the totals row too: see *Group rows and the totals row are records too* on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

## Locks

{{story: Lock the cells of closed deals}}

One lock hook answers for three levels. The context it is handed says which one the grid is asking about:

| Asked about | Context |
|---|---|
| A column | \`{ columnName }\` |
| A record's row | \`{ record }\` |
| A cell | \`{ record, columnName }\` |

Check the context before you read it. A hook that reads \`record\` without checking for it fails when the grid asks about a column, and a hook that ignores the context locks every column and every row. The levels, the order they are checked in, how each is drawn and their labels are on [**Editing**](?path=/docs/grid-editing--overview).

## Validation

{{story: Keep a day under ten hours}}

- The hook runs for every column of every record, so check \`columnName\` first.
- An error it sets outlines the cell and refuses the record's save, on top of the built-in checks: see *Validation* on [**Editing**](?path=/docs/grid-editing--overview).
- A rule that reads other records gives them a new answer whenever one of them changes, so redraw the cells with \`cells.render()\`, as this module does.

## Cells

{{story: Refresh prices from a supplier}}

{{story: Assign new tickets to yourself}}

- Push to \`result.items\` for buttons and to \`result.overflowItems\` for the overflow menu. How they are drawn, and when they show, is under *Row commands* on [**Columns**](?path=/docs/grid-columns--overview).
- For commands that only one column offers, \`settings.cell.onGetCommands\` in \`colDefs\` does the same, after the hooks.

{{story: Placeholders for missing values}}

The parameters hook changes what a cell's control is handed. Each parameter is an object with a \`raw\` value, such as \`{ raw: 'Unassigned' }\`. A cell that only shows its value is drawn by the grid's value renderer, which reads these:

| Parameter | What it does |
|---|---|
| \`Placeholder\` | The text an empty cell shows. Default \`---\`. |
| \`PrefixIcon\`, \`SuffixIcon\` | The name of a Fluent icon drawn before or after the value. |
| \`IsPrimaryColumn\` | \`true\`, with \`EnableNavigation\` also \`true\`, draws the value as a link that opens the record. |
| \`EnableNavigation\` | \`false\` draws emails, phones, URLs, lookups and the primary column as plain text. |
| \`EnableOptionSetColors\` | \`true\` draws options that have a colour as tags. |
| \`IsMultiline\` | \`true\` wraps the text onto the lines its row has room for, up to six. |
| \`ColumnAlignment\` | \`'left'\`, \`'center'\` or \`'right'\`. |

- \`takesInput\` is \`true\` for an editor and for a one-click cell. Those are drawn by the column's editing control, which takes that control's own parameters; the text field also reads \`Placeholder\`.
- The value renderer reads the value from the record, so changing \`value\` here shows nothing. To change what a value reads as, use \`record.expressions.setFormattedValueExpression\`.
- For one column, \`settings.cell.onGetControlParameters\` in \`colDefs\` does the same, after the hooks.

## Rows

{{story: Taller rows for urgent tickets}}

- Leave \`result.height\` unset for the grid's \`rowHeight\`. \`rowSettings.onGetHeight\` runs after the hooks, and a height set with \`rows.setRowHeight\`, which is what a user's drag on a row's resize grip does, wins over both.
- AG Grid asks for a row's height when it lays the row out. After a change that should resize rows, call \`resetRowHeights()\` on the \`gridApi\` service.
- A grid without \`height\` stops growing after \`maxVisibleRows\` rows of \`rowHeight\`, so taller rows fit fewer of themselves in it: see *Sizing* on [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview).

## Columns

{{story: Columns by role}}

- The hook is handed the definitions built so far: one per provider column that is not hidden, with the column's name as \`colId\`; the save status column of an editable grid; and what the hooks that ran before it added, such as the checkbox column at \`GRID_MODULE_PRIORITY.rowSelection\`. Change entries, push new ones, splice them out or reorder them.
- It runs when the grid is ready and on every load of the provider, so a change to what it reads shows after \`provider.refresh()\`.
- At the default priority it runs before the modules, which can overwrite what it sets: sorting sets \`sortable\` on every provider column, and grouping pins grouped columns and moves them first. \`GRID_MODULE_PRIORITY.clipboard + 1\` runs after every built-in module, and \`colDefs\` still runs after that.
- A column a hook adds gets the grid's header and an empty cell, as a column added through \`colDefs\` does: see [**Columns**](?path=/docs/grid-columns--overview).

## Headers

{{story: Copy a column's values}}

- A section is \`{ key, title, items }\`, as under *The header* on [**Columns**](?path=/docs/grid-columns--overview). The built-in sections are \`'sorting'\`, \`'filtering'\`, \`'grouping'\` and \`'aggregation'\`, pushed at their modules' priorities, so a section at the default priority comes above them.
- \`registerColumnMenuItems\` runs after the sections are laid out and is handed every item, each section's heading included, keyed \`'<section key>Header'\`. Use it to move or remove what a section cannot.
- \`header\` is an \`IGridColumnHeader\`: \`getColumn()\` is the provider's column, \`undefined\` for a column you added; \`getColDef()\`, \`getName()\`, \`getSettings()\`, \`getAlignment()\`, \`isLocked()\`, \`isRequired()\`, \`getElement()\`, \`openMenu()\` and \`closeMenu()\` answer the rest.

{{story: Show the currency in the header}}

- An adornment is \`{ key, placement, title?, onRender? }\`, as under *The header* on [**Columns**](?path=/docs/grid-columns--overview).
- The modules add the sort arrow, the filter funnel and the total's title after the name, and the group icon before it. At the default priority, yours come before theirs on the same side.
- A header's colours come from \`registerColumnHeaderTheme\`: see [**Appearance**](?path=/docs/grid-appearance--overview).
`

const meta = {
    title: 'Grid/Extending/Hooks',
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
                story: `A won or lost deal keeps its numbers. \`editing.locks.registerLock\`, asked about a cell, locks Products, Value, Probability and Close date once a deal is closed, and the \`valueLocked\` label says why. Set a deal's Stage to Won: its numbers lock at once, and Stage stays open to reopen the deal.`,
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
                story: `Payroll caps a consultant's day at ten hours. \`registerValidation\` on the \`validation\` service adds up every entry of the same employee on the same day, and \`cells.render()\` redraws the other entries when one of them changes. Anna Novak's Monday and Chloé Martin's Wednesday are already over: cut one entry's hours until the day is back to ten, and both entries of that day clear.`,
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
                story: `The shop takes its prices from a supplier's price list, which answers one product at a time. \`registerCellLoading\` on the \`cells\` service draws a shimmer in each Price cell until that product's price is back. \`cells.render()\` shows the shimmers at once, and writing each new price redraws its row. Press Refresh prices.`,
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
                story: `New tickets have nobody on them yet. \`registerCellCommands\` on the \`cells\` service offers Assign to me in the Assigned to cell of every unassigned ticket; it assigns the ticket, moves it to In progress and saves it. Hover a New ticket and pick Assign to me.`,
            },
        },
    },
}

export const PlaceholdersForMissingValues: Story = {
    name: 'Placeholders for missing values',
    render: () => renderStory(<PlaceholdersExample />),
    parameters: {
        docs: {
            description: {
                story: `An empty cell should say what is missing. \`registerControlParameters\` on the \`cells\` service hands the Assigned to and Customer cells a \`Placeholder\` in place of \`---\`, and their editors get it too. New tickets read Unassigned; clear a ticket's Customer to see No customer.`,
            },
        },
    },
}

export const TallerRowsForUrgentTickets: Story = {
    name: 'Taller rows for urgent tickets',
    render: () => renderStory(<UrgentRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `A support desk wants its urgent tickets to stand out. \`registerRowHeight\` on the \`rows\` service makes every High priority row 64px tall, and \`resetRowHeights()\` makes AG Grid ask again when a priority changes. Change a ticket's Priority to High, or back to Normal.`,
            },
        },
    },
}

export const ColumnsByRole: Story = {
    name: 'Columns by role',
    render: () => renderStory(<ColumnsByRoleExample />),
    parameters: {
        docs: {
            description: {
                story: `Consultants log their hours without seeing what the client is billed. \`registerColumnDefinitions\` on the \`columns\` service hides Hourly rate unless a project manager is signed in, and reads the role through a getter because the module is built once. Switch to Project manager: \`provider.refresh()\` reloads the provider, and the columns are built again with Hourly rate.`,
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
                story: `A sales lead pastes a column of the pipeline into an email. \`registerColumnMenuSection\` on \`columns.headers\` adds a Column section with Copy column values to every column's menu, below Sorting and Filtering because it runs at \`GRID_MODULE_PRIORITY.aggregation + 1\`. Filter Stage to Negotiate, then copy the Deal column from its menu.`,
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
                story: `The shop's prices are in US dollars, and the header says so. \`registerColumnHeaderAdornments\` on \`columns.headers\` draws USD after the name of every currency column, and its \`title\` joins the header's tooltip. Hover the Price header to read the tooltip, then sort by Price from its menu: USD stays ahead of the sort arrow.`,
            },
        },
    },
}
