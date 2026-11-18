import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { SearchAndPageExample } from '../../../../dataset-control/guide/features/searchAndPageExamples'

const STEP = 'Search and page'

const DESCRIPTION = `
{{block: progress}}

Anna wants the Contoso deals among all thirty, and a list that long needs pages. A search field finds deals by name, and the footer shows which deals the page holds and moves between pages.

{{canvas: Search and page}}

## How it works

This step adds to the list of [**When loading fails**](?path=/docs/controls-datasetcontrol-guide-basics-when-loading-fails--overview) a search field on the right of the header and a footer below the records, and loads with \`loadDeals\` again, which does not fail. In **Code**, the new lines carry \`//new:\`.

**Quick find.** The search field is \`DatasetControl.QuickFind\`:

| The user | The quick find |
|---|---|
| Presses Enter, or the search icon | Searches for what is typed |
| Clicks the field | Opens a callout that lists the columns it searches |
| Starts the query with \`*\` | Warns in the callout that the search is slower |
| Presses the cross | Empties the field and searches again |

The placeholder names the records after the metadata's \`DisplayCollectionName\`, or says *records*. The field is disabled while the provider loads, and when it searches no columns.

The provider decides which columns are searched and what matches: the metadata in *deals.ts* names \`name\` in \`QuickFindColumns\`, so the callout lists *Deal*. How a provider searches is on [**Data providers**](?path=/docs/concepts-data-providers--overview).

**Paging.** \`DatasetControl.PageSizeSwitcher\` shows which records the page holds and opens a menu of page sizes; \`DatasetControl.Pagination\` moves to the first, previous and next page, with the page number between the buttons. Both are disabled while the provider loads, and the buttons while there is no page to move to.

| The provider | The range reads |
|---|---|
| Counts its records | *1 - 25 of 30* |
| Has no total | *1 - 25+* while there are more pages |
| Counts past its limit | *1 - 25 of 5000+* |

\`pageSizes\` sets the sizes the menu offers, \`[25, 50, 75, 100, 250]\` unless you give your own; it is read at mount. A \`MemoryDataProvider\` created without a \`pageSize\` holds every record on one page, so the range reads *1 - 30 of 30* and no size is ticked until the user picks one.

## Try it

- Switch to *All deals* and search for *Contoso*: three deals are left, and the range reads *1 - 3 of 3*.
- Click the search field: the callout lists *Deal*. Press the cross: the thirty deals are back.
- Open the range and pick **25**: it reads *1 - 25 of 30*. Press the next page: *26 - 30 of 30*, on page 2.
- In **Code**, give \`PageSizeSwitcher\` \`pageSizes={[10, 20]}\`: the menu offers 10 and 20.

## Remember

- \`QuickFind\` searches and the paging parts page, both through the provider.
- The provider names the columns searched, in \`QuickFindColumns\`.
- \`pageSizes\` sets the sizes offered: 25, 50, 75, 100 and 250 by default.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Features/Search and page',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SearchAndPage: Story = {
    name: 'Search and page',
    tags: ['!dev'],
    render: () => renderStory(<SearchAndPageExample />),
}
