import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { PagingExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.PageSizeSwitcher\` shows which records the page holds, such as *1 - 25 of 120*, and opens a menu of page sizes: 25, 50, 75, 100 and 250, or the ones its \`pageSizes\` lists. \`DatasetControl.Pagination\` moves to the first, previous and next page, and shows the current page.

\`\`\`tsx
<DatasetControl.Footer>
    <DatasetControl.Footer.Start>
        <DatasetControl.PageSizeSwitcher />
    </DatasetControl.Footer.Start>
    <DatasetControl.Footer.End>
        <DatasetControl.Pagination />
    </DatasetControl.Footer.End>
</DatasetControl.Footer>
\`\`\`

- Without a total from the provider, the range ends with a \`+\` while there are more pages. Past the provider's count limit, the total shows as *5000+*.
- The paging buttons are disabled while there is no page to move to.

| Part | Props |
|---|---|
| \`PageSizeSwitcher\` | \`pageSizes\`, the sizes the menu offers, read at mount; \`labels\`; \`components\` (\`onRenderButton\`) |
| \`Pagination\` | \`labels\`, \`components\` (\`onRenderCommandBar\`) |

{{story: Page through the deals}}
`

const meta = {
    title: 'DatasetControl/Parts/Paging',
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

export const PageThroughTheDeals: Story = {
    name: 'Page through the deals',
    render: () => renderStory(<PagingExample />),
    parameters: {
        docs: {
            description: {
                story: `Set the page size to 25, then move to the next page and back.`,
            },
        },
    },
}
