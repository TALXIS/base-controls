import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { YourFirstDealListExample } from '../../../../dataset-control/guide/basics/yourFirstDealListExamples'

const STEP = 'Your first deal list'

const DESCRIPTION = `
{{block: progress}}

The guide builds the sales team's deal list, one step at a time. This first step puts the team's 30 deals on the page in a read-only grid: the control loads them, and the grid inside it draws them.

{{canvas: Your first deal list}}

## How it works

A deal list needs your records, a provider that holds them, and an \`onLoad\` that hands the provider to the control.

| In the code | What it is |
|---|---|
| \`deals\` | The 30 deals of the docs dataset, copied once outside \`onLoad\`, so every load works on the same records. |
| \`MemoryDataProvider\` | The provider: it holds the records in memory, and sorts, filters, searches and pages them. \`metadata\` names a deal's id and name columns, its entity and the columns a search looks in; \`columns\` describes the columns, here \`DEAL_COLUMNS\`. |
| \`onLoad\` | Returns \`{ provider }\`. The control calls it on every load, so \`loadDeals\` makes a new provider each time, over the same \`deals\`. |
| \`DatasetControl\` | Holds the deals: it calls \`onLoad\` and hands the provider to every part inside it. \`height\` sets how tall it is, and the grid scrolls inside it. |
| \`DatasetControl.Body\` | The region that holds what draws the records. |
| \`ClientSideGrid\` | Draws the records. It takes no provider of its own: it draws the control's. Here it is read-only. |

**Parts and regions.** Whatever goes inside the control is a part, such as the grid, and every part works on the provider the control loaded. Parts sit in the control's regions: the body in the middle, with a header above it and a footer below, as [**Lay it out**](?path=/docs/controls-datasetcontrol-guide-features-lay-it-out--overview) shows.

How a provider sorts, searches and pages is on [**Data providers**](?path=/docs/concepts-data-providers--overview). Like every control, the deal list needs the root providers from [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview); the examples of this guide already have them.

## Try it

- Open **Data**: it lists the 30 deals the grid draws, with their columns.
- In **Code**, change \`columns: DEAL_COLUMNS\` to \`columns: DEAL_COLUMNS.slice(0, 4)\`: the grid shows four columns, *Deal* to *Products*.
- Change \`DEAL_ROWS.map\` to \`DEAL_ROWS.slice(0, 5).map\`: the grid and **Data** hold five deals.

## Remember

- \`onLoad\` returns \`{ provider }\`, and the parts inside the control draw it.
- \`onLoad\` runs on every load, so keep your records outside it.
- The grid in the body takes no provider of its own.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Basics/Your first deal list',
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

export const YourFirstDealList: Story = {
    name: 'Your first deal list',
    tags: ['!dev'],
    render: () => renderStory(<YourFirstDealListExample />),
}
