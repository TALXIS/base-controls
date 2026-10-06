import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ModuleIconsExample, SaveStatusExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Modules draw pieces of their own: the sort arrow, the filter icon, the group row, the totals, the row checkbox and the save status. Replace any of them through the \`components\` option of the module that draws it.

| Module | Keys |
|---|---|
| \`createEditingModule\` | \`recordSaveCell\` (\`container\`, \`indicator\`, \`errorCallout\`), \`recordLockCell\` (\`container\`, \`lockIcon\`) |
| \`createRowSelectionModule\` | \`cell\`, \`header\` |
| \`createSortingModule\` | \`sortIcon\` |
| \`createFilteringModule\` | \`filterIcon\`, \`filterCallout\` |
| \`createGroupingModule\` | \`groupingIcon\`, \`groupCell\`, \`expansionHeader\` |
| \`createAggregationModule\` | \`totalCell\`, \`aggregateCell\` |

- Every key is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

{{story: Module icons of your own}}

{{story: Save status your way}}
`

const meta = {
    title: 'Grid/Appearance/Modules',
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
