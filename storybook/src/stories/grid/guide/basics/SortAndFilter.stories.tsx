import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { SortAndFilterExample } from '../../../../grid/guide/basics/sortAndFilterExamples'

const STEP = 'Sort and filter'

const DESCRIPTION = `
{{block: progress}}

The team orders the pipeline and narrows it down, from each column's menu. This step adds the sorting and filtering modules to the grid.

{{canvas: Sort and filter}}

## How it works

This step adds two modules to the grid of [**Check what users enter**](?path=/docs/controls-grid-guide-basics-check-what-users-enter--overview). In **Code**, the new lines carry \`//new:\`.

**The column menu.** A click on a header opens the column's menu; it never sorts by itself. Each module adds a section:

| Section | Offers | The header shows |
|---|---|---|
| Sorting | The two directions, worded for the data type, such as *Sort A to Z*, *Sort smaller to larger*, *Sort older to newer* or *No to Yes*; **Clear** while the column is sorted. Hold Shift as you pick a direction to add the column as a further sort level. | An arrow |
| Filtering | **Filter By**, which opens a callout under the header: pick an operator and a value and press **Apply**; **Clear** while the column is filtered | A funnel |

The conditions of all filtered columns apply together. A callout opens on its data type's own operator, such as *Contains* for text; on an option set, *Equals* takes several options, and dates are compared by day. Every sort or filter loads the deals again; over unsaved changes, the browser asks first, as the DatasetControl guide's [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview) says.

**What a column offers.** The column decides, and the provider fills in its defaults:

| Feature | A column offers it while | To take it off a column |
|---|---|---|
| Sorting | \`disableSorting\` is not set; the provider sets it on multi-select option sets | \`disableSorting: true\` on the column |
| Filtering | \`metadata.SupportedFilterConditionOperators\` holds an operator; the provider fills in every operator of the data type | \`SupportedFilterConditionOperators: []\` |

The operators of each data type are under *Filter operators* on [**Reference**](?path=/docs/controls-grid-reference--overview).

**Sorted and filtered from the start.** Sorting and filtering are the provider's: set them on the provider before it loads, usually in a view, as the DatasetControl guide's [**Views**](?path=/docs/controls-datasetcontrol-guide-basics-views--overview) does; how to write a condition's values is under *Filter operators* on [**Reference**](?path=/docs/controls-grid-reference--overview). Once a user applies or clears a column's filter, the provider's filter becomes the column conditions, all of them required. Neither module raises an event when the sorting or a filter changes: read them from the provider in \`onDataLoaded\`, as [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview) shows.

## Try it

- Open *Value*'s menu and pick **Sort larger to smaller**: one of Ben Carter's $31,500.00 deals comes first, and an arrow shows in *Value*'s header.
- Pick **Sort A to Z** in *Account manager*'s menu, then hold Shift and pick **Sort larger to smaller** in *Value*'s: Anna Novak's deals come first, her biggest at the top.
- Open *Stage*'s menu, pick **Filter By**, pick *Negotiate* and press **Apply**: six deals, all Chloé Martin's, and a funnel after *Stage*.
- Change a value, then sort: the browser asks whether to discard the change.

## Remember

- Sorting and filtering are the provider's; every change loads the deals again.
- A column's \`disableSorting\` and metadata decide what its menu offers.

Your grid reads, edits, checks and saves the deals. Features adds the tools a sales team works with.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Basics/Sort and filter',
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

export const SortAndFilter: Story = {
    name: 'Sort and filter',
    tags: ['!dev'],
    render: () => renderStory(<SortAndFilterExample />),
}
