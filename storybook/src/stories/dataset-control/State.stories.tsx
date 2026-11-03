import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BackWhereYouLeftOffExample, InsideTheStoreExample } from '../../dataset-control/examples/stateExamples'

const DESCRIPTION = `
A DatasetControl puts every view back the way the user left it when they switch back to it. Give it a \`stateKey\` to also reopen on the last view, as the user left it, the next time the control mounts.

\`\`\`tsx
<DatasetControl stateKey='deals' onLoadViews={loadViews} onLoad={loadDeals} height='600px'>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={modules} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

| \`stateKey\` | Where the control keeps it | How long it lasts |
|---|---|---|
| Left out | A store of its own | While the control stays mounted, across view switches and reloads. |
| Given | Under the key in the nearest state store | As long as the store does. See [**State persistence**](?path=/docs/concepts-state-persistence--overview). |

{{story: Back where you left off}}

## What the control keeps

| What | Kept | Put back |
|---|---|---|
| The view the user is on | When a view is asked for, and when it has loaded | On the next mount, when the view is still listed. |
| Per view: the columns and the related entities they come from, sorting, filtering, page, page size, search and selection | As the view's mount goes: on a view switch, a reload, or when the control unmounts | The next time the view loads, over the columns the view sets and what \`onLoad\` set up, before its first page loads. |
| Per view: what the parts keep, such as where a grid is scrolled | As the user works | The next time the view is shown. |

- A view the user hasn't opened yet starts from what the view and \`onLoad\` set up; one they have opened starts from what was kept.
- A grid keeps its scroll only with a \`stateKey\` of its own, unique within the control: see [**Grid › State**](?path=/docs/controls-grid-state--overview).

## Roll out a change, or start over

What was kept replaces what the view sets up, so a change to a view's definition, such as its columns or sorting, reaches only users who have never opened that view under this store. To start over:

| To start over | Do |
|---|---|
| One view, for everyone | Give the view a new id. |
| The whole control, for everyone | Change its \`stateKey\`. |
| The whole control, for one user | Delete its entry from their saved dictionary before the control mounts, such as with \`store.delete('deals')\`. |

## Where it is kept

Everything the control keeps is plain data under its \`stateKey\`, in the tree laid out under *Nest components* on [**State persistence**](?path=/docs/concepts-state-persistence--overview). A view's \`provider\` entry is an \`IDatasetControlProviderState\`.

{{story: Look inside the store}}

## Keep your own part's state

\`useControlStateStore(stateKey)\` gives a component of your own a store in the view shown, so its state comes back with the view: see *Keep state in your own component* on [**State persistence**](?path=/docs/concepts-state-persistence--overview). A gallery that keeps its scroll this way is under *Your own collection view* on [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).
`

const meta = {
    title: 'Controls/DatasetControl/State',
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

export const BackWhereYouLeftOff: Story = {
    name: 'Back where you left off',
    render: () => renderStory(<BackWhereYouLeftOffExample />),
    parameters: {
        docs: {
            description: {
                story: `Every view comes back as the user left it, and the control reopens on the last view. Try: sort *All deals* by value, search and scroll, switch to *Won deals* and back, then hide the deals and show them again.`,
            },
        },
    },
}

export const InsideTheStore: Story = {
    name: 'Look inside the store',
    render: () => renderStory(<InsideTheStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `The control's store beside it, as plain data, kept in a dictionary as a PCF control's state would be. Try: scroll the grid and watch \`views.all.parts.grid\` follow, then sort and switch to *Won deals* to see \`views.won\` start its own entry.`,
            },
        },
    },
}
