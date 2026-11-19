import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { OpenGroupsOnDemandExample } from '../../../../grid/guide/features/openGroupsOnDemandExamples'

const STEP = 'Open groups on demand'

const DESCRIPTION = `
{{block: progress}}

The CRM is slow with big pipelines, so each account manager's deals are fetched only when their group opens. This step draws the deals with \`ServerSideGrid\`.

{{canvas: Open groups on demand}}

## How it works

The grid is the one of [**Back where they left off**](?path=/docs/controls-grid-guide-features-back-where-they-left-off--overview) without the toggle, drawn by \`ServerSideGrid\` in place of \`ClientSideGrid\`, with every group closed at first. The deals come from *remoteDeals.ts*, a CRM that takes a second to fetch a group's deals and fails the first time; \`loadRemoteDeals\` groups and totals them as \`loadPipeline\` did. In **Code**, the new lines carry \`//new:\`.

**Row models.** The **row model** decides how the grid gets its rows. \`ClientSideGrid\` loads the client-side row model ahead of your \`modules\`, and \`ServerSideGrid\` the server-side one, which needs AG Grid Enterprise, as [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview) says. \`Grid\` itself loads none, so its \`modules\` must hold \`createClientSideRowModelModule()\` or \`createServerSideRowModelModule()\`. Without grouping both show the same rows; grouped, they differ:

| Component | A group's records are fetched | Opening a group | A fetch that fails |
|---|---|---|---|
| \`ClientSideGrid\` | For every group, at every level, after each load | Shows its records at once | Leaves the group empty |
| \`ServerSideGrid\` | As the group opens, and again after each load while it is open | Shows a loading row until they arrive | Shows a row with the error |

Use \`ClientSideGrid\` unless users group by a column with many values, or into big groups.

**A group's records.** A group's records are fetched by a provider of the group's own, up to 5,000; \`getParentDataProvider()\` tells it apart from the list's, as *remoteDeals.ts* does. The error row shows that provider's message: for an error thrown while fetching, *Error: Failed to retrieve data. Please contact your system administrator.*, whatever the error says. **Refresh** loads the deals again and fetches every open group anew. To draw the loading and error rows your way, see *Slots* on [**Reference**](?path=/docs/controls-grid-reference--overview); the grid's overlays are on [**Loading and nothing to show**](?path=/docs/controls-grid-guide-make-it-yours-loading-and-nothing-to-show--overview).

## Try it

- Open Anna Novak's group: a loading row shows for a second, then a row says *Error: Failed to retrieve data. Please contact your system administrator.* Press **Refresh**: her 8 deals load.
- Open Ben Carter's group: a loading row shows for a second, then his 8 deals.
- Close Ben Carter's group and open it again: his deals show at once.
- In **Code**, put \`ClientSideGrid\` back in place of \`ServerSideGrid\`, in the import too, then open Anna Novak's and Ben Carter's groups: both open at once, but Anna Novak's is empty, as the edit runs *remoteDeals.ts* again and her group's fetch fails. Press **Refresh**: her deals arrive.

## Remember

- The row model decides how rows arrive: \`ClientSideGrid\` fetches every group with the list, \`ServerSideGrid\` each group as it opens.
- A group's records come from a provider of the group's own.
- \`ServerSideGrid\` needs AG Grid Enterprise.

Your grid has the tools a sales team works with. *Make it yours* shapes it to your app.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Features/Open groups on demand',
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

export const OpenGroupsOnDemand: Story = {
    name: 'Open groups on demand',
    tags: ['!dev'],
    render: () => renderStory(<OpenGroupsOnDemandExample />),
}
