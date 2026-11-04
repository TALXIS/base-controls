import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BackWhereYouLeftOffExample, InsideTheStoreExample } from '../../dataset-control/examples/stateExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
A DatasetControl remembers how the user left each view, such as its sorting, search, page and scroll, so switching away and back puts the view back. Give it a \`stateKey\` and it also reopens on the last view, as the user left it, the next time it mounts. Try it below: sort *All deals* by value, switch to *Won deals* and back.

{{canvas: Back where you left off}}

## Keep it across mounts

| \`stateKey\` | Where the control keeps it | How long it lasts |
|---|---|---|
| Left out | A store of its own | While the control stays mounted, across view switches and reloads. |
| Given | Under the key in the nearest state store | As long as the store does: see [**State persistence**](?path=/docs/concepts-state-persistence--overview). |

## What the control keeps

- **The view the user is on:** kept when a view is asked for and when it has loaded; put back on the next mount, while the view is still listed.
- **Per view, the provider's state:** the columns and the related entities they come from, sorting, filtering, page, page size, search and selection. Kept as the view's mount goes, on a view switch, a reload or when the control unmounts; put back the next time the view loads, before its first page.
- **Per view, what the parts keep**, such as where a grid is scrolled: kept as the user works; put back the next time the view is shown.

What was kept wins over what the view and \`onLoad\` set up, so a view the user has not opened yet starts from the view, and one they have opened starts from what was kept. A grid keeps its scroll only with a \`stateKey\` of its own, unique within the control: see [**State**](?path=/docs/controls-grid-state--overview) in Grid.

## Roll out a change, or start over

A change to a view's definition, such as its columns or sorting, reaches only users who have never opened that view under this store. To start over:

| To start over | Do |
|---|---|
| One view, for everyone | Give the view a new id. |
| The whole control, for everyone | Change its \`stateKey\`. |
| The whole control, for one user | Delete its entry from their saved dictionary before the control mounts, such as with \`store.delete('deals')\`. |

## Look inside the store

Everything the control keeps is plain data under its \`stateKey\`, in the tree described on [**State persistence**](?path=/docs/concepts-state-persistence--overview). A view's \`provider\` entry is an \`IDatasetControlProviderState\`.

{{story: Look inside the store}}

## Keep your own part's state

A component of your own comes back with the view when it keeps its state in \`useControlStateStore(key)\`: see [**State persistence**](?path=/docs/concepts-state-persistence--overview). The product gallery on [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview) keeps its scroll this way.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'State persistence', iconName: 'History', href: '?path=/docs/concepts-state-persistence--overview', text: 'Where state is kept, and how to keep it in a PCF control.' },
    { title: 'User views', iconName: 'SaveAs', href: '?path=/docs/controls-datasetcontrol-views-user-views--overview', text: 'Let users save a view the way they left it, under a name of their own.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Parts of your own that come back with the view.' },
]

const meta = {
    title: 'Controls/DatasetControl/State',
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

export const BackWhereYouLeftOff: Story = {
    name: 'Back where you left off',
    render: () => renderStory(<BackWhereYouLeftOffExample />),
}

export const InsideTheStore: Story = {
    name: 'Look inside the store',
    render: () => renderStory(<InsideTheStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `The control's store beside it, as plain data, kept in a dictionary as a PCF control's state would be. Try: scroll the grid and watch \`views.all.parts.grid\` follow.`,
            },
        },
    },
}
