import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { BackWhereTheyLeftOffExample, InsideTheStoreExample } from '../../../../dataset-control/guide/your-data/backWhereTheyLeftOffExamples'

const STEP = 'Back where they left off'

const DESCRIPTION = `
{{block: progress}}

Anna sorts *All deals* by value, opens another page of the app, and comes back to the list. This step brings her back to *All deals*, sorted as she left it.

{{canvas: Back where they left off}}

## How it works

The control keeps its **state**: the view the user is on and, for each view, how they left it. A \`stateKey\` decides how long it lasts:

| \`stateKey\` | Where the control keeps its state | How long it lasts |
|---|---|---|
| Left out | A store of its own | While the control stays mounted, across view switches and loads |
| Given | Under the key, in the nearest state store | As long as the store does: see [**State persistence**](?path=/docs/concepts-state-persistence--overview) |

On this page the nearest store is the page's own, kept in memory, so the state outlives the toggle but not a reload of the page.

### What the control keeps

| What | Kept | Put back |
|---|---|---|
| The view the user is on | When a view is asked for, and when it has loaded | On the next mount, while the view is still listed |
| For each view, the provider's state: its columns and the related entities they come from, sorting, filtering, page, page size, search and selection | As the view's mount goes, on a view switch, a load or an unmount | The next time the view loads, before its first page |
| For each view, what the parts keep, such as where the grid is scrolled | As the user works | The next time the view is shown |

What was kept wins over what the view and \`onLoad\` set up, so a view the user has not opened yet starts from the view, and one they have opened starts from what was kept. The grid keeps its own state only with a \`stateKey\` of its own, unique within the control; what it keeps is on [**State**](?path=/docs/controls-grid-state--overview) in Grid. A component of your own keeps its state for each view with \`useControlStateStore(key)\`, as on [**State persistence**](?path=/docs/concepts-state-persistence--overview).

### Start over

A change to a view, such as its columns or sorting, reaches only the users who have not opened that view under this store yet. To start over:

| For | Do |
|---|---|
| One view, for everyone | Give the view a new \`id\`. |
| The whole control, for everyone | Change its \`stateKey\`. |
| The whole control, for one user | Delete its entry from their store before the control mounts, such as with \`store.delete('guide.back')\`. |

## Look inside the store

Everything the control keeps is plain data under its \`stateKey\`: the \`viewId\`, then each view's \`provider\` and \`parts\`. This example puts its own \`StateStore\` around the control, writing into a dictionary as a PCF control's state would, and shows the dictionary beside it.

{{canvas: Look inside the store}}

## Try it

- Switch to *All deals*, sort by *Value*, switch to *Won deals* and back: still sorted.
- Turn *Show the deals* off and on: the list opens on *All deals*, sorted.
- In **Code**, remove \`stateKey='guide.back'\`, switch to *All deals*, and turn the list off and on: it opens on *My deals*.
- In *Look inside the store*, search for *Contoso*, then switch to *Won deals*: \`views.my.provider.searchQuery\` reads *Contoso*, and \`viewId\` reads *won*.

## Remember

- The control keeps its views' state while it is mounted; a \`stateKey\` keeps it in a store that outlives it.
- What was kept wins over the view.
- A new view \`id\` or a new \`stateKey\` starts over.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Your data/Back where they left off',
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

export const BackWhereTheyLeftOff: Story = {
    name: 'Back where they left off',
    tags: ['!dev'],
    render: () => renderStory(<BackWhereTheyLeftOffExample />),
}

export const LookInsideTheStore: Story = {
    name: 'Look inside the store',
    tags: ['!dev'],
    render: () => renderStory(<InsideTheStoreExample />),
}
