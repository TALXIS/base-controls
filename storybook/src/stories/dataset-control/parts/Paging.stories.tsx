import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { PagingExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.PageSizeSwitcher\` shows which records the page holds, such as *1 - 25 of 120*, and opens a menu of page sizes. \`DatasetControl.Pagination\` moves to the first, previous and next page, and shows the current one.

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
- Moving to another page, or changing the page size, asks first when there are unsaved changes.

{{story: Page through the deals}}

## Props

| Part | Prop | Type | Default | Description |
|---|---|---|---|---|
| \`PageSizeSwitcher\` | \`pageSizes\` | \`number[]\` | 25, 50, 75, 100, 250 | The sizes the menu offers. Read once, at mount. |
| \`PageSizeSwitcher\` | \`labels\`, \`components\` | | | See [**Localization**](?path=/docs/datasetcontrol-localization--overview) and [**Appearance**](?path=/docs/datasetcontrol-appearance--overview). |
| \`Pagination\` | \`labels\`, \`components\` | | | See [**Localization**](?path=/docs/datasetcontrol-localization--overview) and [**Appearance**](?path=/docs/datasetcontrol-appearance--overview). |

## From your code

The paging buttons are \`control.parts.get('pagination')\`, and the page size switcher is \`control.parts.get('pageSizeSwitcher')\`:

\`\`\`tsx
control.parts.get('pageSizeSwitcher').setPageSize(100)
control.parts.get('pagination').moveFirst()
\`\`\`

| \`pagination\` | Description |
|---|---|
| \`getPageNumber()\` | The current page, counted from 1. |
| \`canMovePrevious()\`, \`canMoveNext()\` | Whether there is a page to move to, and nothing is loading. |
| \`moveFirst()\`, \`movePrevious()\`, \`moveNext()\` | Loads that page. |
| \`events\` | \`onPagingChanged\`, whenever the page changes or starts loading. |

| \`pageSizeSwitcher\` | Description |
|---|---|
| \`getPageSize()\`, \`getPageSizes()\` | The page size, and the sizes the menu offers. |
| \`setPageSize(size)\` | Loads the records in pages of that size. |
| \`getRecordRange()\` | \`{ first, last, total }\` of the page, as the switcher shows it. |
| \`events\` | \`onPageSizeChanged\`, whenever the page size or the records on the page change. |
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
