import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyCatalogueExample, LoadingRowsExample, ModuleIconsExample, SaveStatusExample, WarehouseLoadingExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Besides cells and headers, the grid and its modules draw pieces of their own: overlays, loading rows, the save status, checkboxes and icons. Each takes a \`components\` object of \`onRender…\` functions. Every key is optional, and a function is called, not mounted, so return a component when you need hooks.

## The grid

Pass these in \`components\` on \`<Grid.Root />\`:

| Key | Parts | Shown |
|---|---|---|
| \`emptyRecordsOverlay\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | When there are no rows |
| \`loadingOverlay\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | While the provider loads, with its \`setLoading(true, message)\` message |
| \`rowLoading\` | \`onRenderShimmer\` | While a group's rows load, on the server-side row model |
| \`rowError\` | \`onRenderMessageBar\` | When rows or totals fail to load |

{{story: An empty catalogue}}

{{story: Waiting for the warehouse}}

{{story: Rows that are still loading}}

## The editing module

The editing module draws each row's save status and the lock of a locked record. Pass their parts in \`createEditingModule({ components })\`: \`recordSaveCell\` (\`container\`, \`indicator\`, \`errorCallout\`) and \`recordLockCell\` (\`container\`, \`lockIcon\`).

{{story: Save status your way}}

## Other modules

| Module | Keys |
|---|---|
| \`createRowSelectionModule\` | \`cell\`, \`header\` |
| \`createSortingModule\` | \`sortIcon\` |
| \`createFilteringModule\` | \`filterIcon\`, \`filterCallout\` |
| \`createGroupingModule\` | \`groupingIcon\`, \`groupCell\`, \`expansionHeader\` |
| \`createAggregationModule\` | \`totalCell\`, \`aggregateCell\` |

{{story: Module icons of your own}}
`

const meta = {
    title: 'Grid/Appearance/Overlays and modules',
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

export const AnEmptyCatalogue: Story = {
    name: 'An empty catalogue',
    render: () => renderStory(<EmptyCatalogueExample />),
    parameters: {
        docs: {
            description: {
                story: `\`emptyRecordsOverlay\` swaps the icon and adds a hint under the message.`,
            },
        },
    },
}

export const WaitingForTheWarehouse: Story = {
    name: 'Waiting for the warehouse',
    render: () => renderStory(<WarehouseLoadingExample />),
    parameters: {
        docs: {
            description: {
                story: `\`loadingOverlay\` draws a slow warehouse lookup as a card with a progress bar and the provider's message. Press *Check stock again*.`,
            },
        },
    },
}

export const RowsThatAreStillLoading: Story = {
    name: 'Rows that are still loading',
    render: () => renderStory(<LoadingRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`rowLoading\` draws a category's rows as a spinner while they load on the server-side row model. Open a category (AG Grid Enterprise).`,
            },
        },
    },
}

export const SaveStatusYourWay: Story = {
    name: 'Save status your way',
    render: () => renderStory(<SaveStatusExample />),
    parameters: {
        docs: {
            description: {
                story: `\`recordSaveCell\` turns the save status into a labelled button, and names the product in the failed-save callout. Set a price above 1,000.`,
            },
        },
    },
}

export const ModuleIconsOfYourOwn: Story = {
    name: 'Module icons of your own',
    render: () => renderStory(<ModuleIconsExample />),
    parameters: {
        docs: {
            description: {
                story: `Sorting, filtering and grouping icons in the shop's blue, and each category's size as a badge.`,
            },
        },
    },
}
