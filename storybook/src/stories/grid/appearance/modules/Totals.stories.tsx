import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { StockTotalsExample } from '../../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The aggregation module draws each column's total in a row pinned under the rest, and in a group's row. To change how they look, pass \`components\` to \`createAggregationModule\`.

\`\`\`tsx
createAggregationModule({ components: { totalCell: { totalValue: { onRenderValue: props => <strong {...props} /> } } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`totalCell.totalValue\` | \`onRenderContainer\`, \`onRenderLabel\`, \`onRenderValue\` | A column's total and what it is, in the pinned row |
| \`totalCell.container\`, \`loading\`, \`commands\` | As in any cell | The rest of the total's cell |
| \`aggregateCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | A column's total in a group's row |

{{story: Totals that read at a glance}}
`

const meta = {
    title: 'Grid/Appearance/Modules/Totals',
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

export const TotalsThatReadAtAGlance: Story = {
    name: 'Totals that read at a glance',
    render: () => renderStory(<StockTotalsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`totalCell.totalValue\` draws the label small and uppercase and the value bold and blue. In stock is summed and Price averaged.`,
            },
        },
    },
}
