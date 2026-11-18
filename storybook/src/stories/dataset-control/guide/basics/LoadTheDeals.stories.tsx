import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { LoadTheDealsExample } from '../../../../dataset-control/guide/basics/loadTheDealsExamples'

const STEP = 'Load the deals'

const DESCRIPTION = `
{{block: progress}}

Anna Novak opens the list on *My deals*, her own deals, so every load first asks the server who is signed in. Until the deals are in, a grey placeholder stands in for the list.

{{canvas: Load the deals}}

## How it works

The deal list is the one from the last step, with *My deals* first; in **Code**, the new lines carry \`//new:\`.

**Every load mounts the control anew.** The control holds no records of its own: each load calls \`onLoad\`, picks the view and calls its \`resolve\`, loads the first page, and then draws the parts on it. Until then the placeholder stands in for every part, the view switcher included, so put what must show at once, such as a page title, outside the control.

| A load starts on | Where |
|---|---|
| The first mount | |
| Picking a view | The view switcher, from [**Views**](?path=/docs/controls-datasetcontrol-guide-basics-views--overview) |
| **Try again** after a failed load | [**When loading fails**](?path=/docs/controls-datasetcontrol-guide-basics-when-loading-fails--overview) |
| Saving the columns | [**Choose the columns**](?path=/docs/controls-datasetcontrol-guide-features-choose-the-columns--overview) |
| Saving a new view, or closing **Manage views** | [**Views of their own**](?path=/docs/controls-datasetcontrol-guide-your-data-views-of-their-own--overview) |
| \`control.loadView(viewId)\` or \`control.reload()\` | [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview) |

**Load what the views need first.** \`loadDeals\` waits for \`loadSignedInUser()\` before it returns, and \`createDealViews(user)\` makes the views for that user: *My deals* filters by them, with \`owner\` hidden, as *Views* says. It runs on every load, so the placeholder waits for the user on every switch too.

**One provider per load.** Each load makes its own provider, and the control destroys it when it lets it go: on the next load, when the load fails and when the control unmounts. The deals stay in \`deals\`, outside \`onLoad\`, so every new provider starts from them. To keep a provider that the rest of your page uses, return \`destroyProviderOnUnmount: false\` beside it and destroy it yourself: see *Lifetime* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Try it

- Switch to *All deals*: the placeholder stands in for the list while the user loads, then the 30 deals show.
- In **Code**, make \`loadSignedInUser\` return \`'Ben Carter'\`: *My deals* shows his 8 deals, most of them at *Propose*.
- Raise the wait in \`loadSignedInUser\` from \`600\` to \`3000\`: the placeholder stays for three seconds on every switch.

## Remember

- Every load runs \`onLoad\` again and draws the parts anew on the provider it returns.
- Load what the views need at the start of \`onLoad\`.
- Put what must show at once outside the control.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Basics/Load the deals',
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

export const LoadTheDeals: Story = {
    name: 'Load the deals',
    tags: ['!dev'],
    render: () => renderStory(<LoadTheDealsExample />),
}
