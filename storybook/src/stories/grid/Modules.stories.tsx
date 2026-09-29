import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { RowModelsExample, SelectingRowsExample, HighlightingCellsExample, SortingExample, FilteringExample, GroupingExample, TotalsExample } from '../../grid/examples/modulesExamples'

const DESCRIPTION = `
A grid's features are **modules**. You pass the ones you want in \`modules\`; one you leave out does not exist.

| Module | What it adds | Options |
|---|---|---|
| \`rowModel\` | How rows are loaded. **Required.** \`createClientSideRowModelModule()\` takes every record the provider holds at once. \`createServerSideRowModelModule()\` loads a group's records as it is opened. | |
| \`rowSelection\` | A checkbox column, and selecting rows with it | \`mode\`: \`'single'\` or \`'multiple'\`; \`components\` |
| \`cellSelection\` | Highlighting blocks of cells by dragging across them | AG Grid's range options, such as \`enableFillHandle\` |
| \`clipboard\` | Copying cells and pasting into them | AG Grid's clipboard options, such as \`copyHeadersToClipboard\` |
| \`sorting\` | Sorting from a column's menu | \`labels\`, \`components\` |
| \`filtering\` | Filtering from a column's menu | \`labels\`, \`components\` |
| \`grouping\` | Grouping rows by a column | \`type\`, \`defaultExpandedLevel\`, \`pinGroupedColumns\`, \`allowUserGrouping\`, \`maxGroupLoadsPerSelection\`, \`labels\`, \`components\` |
| \`aggregation\` | A totals row, and totals in group rows | \`allowUserAggregation\`, \`labels\`, \`components\` |
| \`license\` | Your AG Grid Enterprise licence | \`key\` |
| \`custom\` | Modules of your own. See [**Write a module**](?path=/story/grid-extending-write-a-module--overview). | |

Which columns can be sorted, filtered, grouped or totalled is up to each column. See [**Data**](?path=/story/grid-data--overview).

## Turning one on

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }} />
\`\`\`

\`modules\` is read at mount.

## AG Grid Enterprise

The server-side row model, cell selection, clipboard and grouping use AG Grid Enterprise features. Pass your licence key once, and AG Grid stops showing its watermark:

\`\`\`tsx
modules={{
    rowModel: createServerSideRowModelModule(),
    license: createLicenseModule({ key: AG_GRID_LICENSE_KEY }),
}}
\`\`\`

## Changing a module's UI

\`labels\` replaces the strings a module draws. \`components\` replaces what it draws, such as \`onRenderSortIcon\` of sorting or \`onRenderGroupCell\` of grouping. An example is on [**Custom Components**](?path=/story/grid-customizations-custom-components--overview).

Every grid below runs the modules it needs and nothing more. Flip **Code** to read them, and edit them.
`

const meta = {
    title: 'Grid/Modules',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: { component: DESCRIPTION },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const RowModels: Story = {
    name: 'Row models',
    render: () => renderStory(<RowModelsExample />),
    parameters: {
        docs: {
            description: {
                story: `Group by a column from its menu, then flip the toggle. The client-side model has every record from the start; the server-side one loads a group's records when it is opened.`,
            },
        },
    },
}

export const SelectingRows: Story = {
    name: 'Selecting rows',
    render: () => renderStory(<SelectingRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`onSelectionChanged\` is called with the selected ids. Change \`'multiple'\` to \`'single'\` and only one row stays selected.`,
            },
        },
    },
}

export const HighlightingAndCopyingCells: Story = {
    name: 'Highlighting and copying cells',
    render: () => renderStory(<HighlightingCellsExample />),
    parameters: {
        docs: {
            description: {
                story: `Cell selection and clipboard together: drag across cells, then copy them. \`copyHeadersToClipboard\` copies the column names with them.`,
            },
        },
    },
}

export const Sorting: Story = {
    name: 'Sorting',
    render: () => renderStory(<SortingExample />),
    parameters: {
        docs: {
            description: {
                story: `Open a column's menu to sort by it. \`labels\` renames the text columns' sort items.`,
            },
        },
    },
}

export const Filtering: Story = {
    name: 'Filtering',
    render: () => renderStory(<FilteringExample />),
    parameters: {
        docs: {
            description: {
                story: `Open a column's menu and pick **Filter By**. A filtered column shows the filter icon in its header.`,
            },
        },
    },
}

export const Grouping: Story = {
    name: 'Grouping',
    render: () => renderStory(<GroupingExample />),
    parameters: {
        docs: {
            description: {
                story: `Grouped by **Account manager** to start with. Group by more columns from their menus: \`'nested'\` gives each its own level, \`'flat'\` puts them on one. \`defaultExpandedLevel\` opens the groups down to that level; \`-1\`, the default, keeps them closed.`,
            },
        },
    },
}

export const Totals: Story = {
    name: 'Totals',
    render: () => renderStory(<TotalsExample />),
    parameters: {
        docs: {
            description: {
                story: `**Value** and **Time spent** are summed to start with. With \`allowUserAggregation\`, a number column's menu lets the user pick its total.`,
            },
        },
    },
}
