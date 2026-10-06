import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ErrorRowsExample, LoadingRowsExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Besides rows of records, the grid draws rows that stand in for records it doesn't have: one while a group's records load, and one when records or totals fail to load. To change how either looks, pass \`components.rows\` to \`<Grid.Root />\`.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{ rowModel: createServerSideRowModelModule(), grouping: createGroupingModule() }}
    components={{ rows: { loading: { onRenderShimmer: () => <Spinner /> } } }} />
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

## Loading

| Key | Parts |
|---|---|
| \`rows.loading\` | \`onRenderShimmer\` |

Stands in for a group's records while they load on the server-side row model.

{{story: Rows that are still loading}}

## Error

| Key | Parts |
|---|---|
| \`rows.error\` | \`onRenderMessageBar\` |

Stands in for records or totals that failed to load, with the provider's error message.

{{story: Try a category again}}
`

const meta = {
    title: 'Grid/Appearance/Custom rows',
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

export const RowsThatAreStillLoading: Story = {
    name: 'Rows that are still loading',
    render: () => renderStory(<LoadingRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`rows.loading\` draws a category's rows as a spinner while they load on the server-side row model. Open a category (AG Grid Enterprise).`,
            },
        },
    },
}

export const TryACategoryAgain: Story = {
    name: 'Try a category again',
    render: () => renderStory(<ErrorRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`rows.error\` turns a failed load into a warning with a *Try again* button, which calls AG Grid's \`retryServerSideLoads()\`. Open a category: the warehouse drops the first one, then answers (AG Grid Enterprise).`,
            },
        },
    },
}
