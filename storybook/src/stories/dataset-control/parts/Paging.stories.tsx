import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { PagingExample } from '../../../dataset-control/examples/partsExamples'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Two parts page through the records: \`DatasetControl.PageSizeSwitcher\` shows which records the page holds and lets the user pick how many a page shows, and \`DatasetControl.Pagination\` moves to the first, previous and next page. Try it below: press *Pages of 10*, then move to the next page.

{{canvas: Page through the deals}}

## How it behaves

- **Range:** the switcher shows the page's records, such as *1 - 25 of 30*.
- **No total:** without a total from the provider, the range ends in \`+\` while there are more pages.
- **Count limit:** past the provider's count limit, the total shows as *5000+*.
- **Current page:** the pagination shows its number between the buttons.
- **Disabled:** the buttons while there is no page to move to, and every control while the provider loads.
- **Unsaved changes:** moving to another page or changing the page size asks about them first: see [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).

## Props

### PageSizeSwitcher

| Prop | Type | Default | Description |
|---|---|---|---|
| \`pageSizes\` | \`number[]\` | \`DEFAULT_PAGE_SIZES\`: 25, 50, 75, 100, 250 | The sizes the menu offers. Read at mount. |
| \`components\` | \`Partial<IPageSizeSwitcherUiComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

### Pagination

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`Partial<IPaginationUiComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('pageSizeSwitcher')\` and \`control.parts.get('pagination')\` return the parts once they are drawn (see *Reach the parts* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)). The example's *Pages of 10* and *First page* go through them. To page the provider directly, see *Sort, filter, search and page* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

### PageSizeSwitcher

| Member | Does |
|---|---|
| \`getPageSize()\`, \`getPageSizes()\` | The page size, and the sizes the menu offers. |
| \`setPageSize(size)\` | Loads the records in pages of that size, asking about unsaved changes first. |
| \`getRecordRange()\` | The range as the switcher shows it: \`{ first: number, last: string, total?: string }\`. |
| \`isLoading()\` | Whether the provider is loading. |
| \`events\` | \`onPageSizeChanged\`, whenever the page size or the records on the page change. |

### Pagination

| Member | Does |
|---|---|
| \`getPageNumber()\` | The current page, counted from 1. |
| \`canMovePrevious()\`, \`canMoveNext()\` | Whether there is a page to move to, and nothing is loading. |
| \`moveFirst()\`, \`movePrevious()\`, \`moveNext()\` | Loads that page, asking about unsaved changes first. |
| \`events\` | \`onPagingChanged\`, whenever the page changes or starts loading. |

**Strings:** \`PAGE_SIZE_SWITCHER_LABELS\`, keys \`pageSizeSwitcher.*\`, and \`PAGINATION_LABELS\`, keys \`pagination.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Notifications and empty state', iconName: 'Info', href: '?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview', text: 'The next part: messages above the records, and what shows when there are none.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Page the provider directly, and how it counts its records.' },
    { title: 'Layout', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-layout--overview', text: 'Place the paging parts in the footer.' },
]

const meta = {
    title: 'Controls/DatasetControl/Parts/Paging',
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

export const PageThroughTheDeals: Story = {
    name: 'Page through the deals',
    render: () => renderStory(<PagingExample />),
}
