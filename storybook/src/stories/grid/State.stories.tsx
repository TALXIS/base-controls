import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { PreviewStateExample, ReopenQueueExample } from '../../grid/examples/stateExamples'

const DESCRIPTION = `
A user who opens a record from a long list and comes back expects to find the list as they left it, not scrolled to the top with every group closed. The grid can remember where the user was, the row at the top, the focused cell and the open groups, and put them back the next time it mounts. You switch this on by giving the grid a \`stateKey\`: the next grid mounted with the same key puts the user back, and without one the grid keeps nothing.

{{story: Bring the user back where they left off}}

The grid reads its state as it mounts and writes it as the user scrolls, focuses cells and opens groups. Inside a DatasetControl it is kept per view, in the control's own state: see [**DatasetControl › State**](?path=/docs/controls-datasetcontrol-state--overview). Where the state lives between sessions is up to [**State persistence**](?path=/docs/concepts-state-persistence--overview).

The column layout, sorting, filtering and grouping belong to the provider, not to this state. See *Remember the layout* on [**Columns**](?path=/docs/controls-grid-columns--overview).

## What the grid keeps

| Key | Shape | Description |
|---|---|---|
| \`viewport\` | \`{ scroll?: { rowId? }, focusedCell?: { rowId, columnId } }\` | The row at the top of the viewport and the focused cell, by AG Grid's row and column ids. The horizontal scroll is not kept. |
| \`grouping\` | \`{ expandedLevel, toggledGroups }\` | How many levels are open, and the groups the user opened or closed against that level, by row id. With the grouping module only. |

On mount, the grid waits for the top row to appear, which inside a group means once that group has loaded, then scrolls it to the top and focuses the cell. If the user scrolls or clicks a cell first, or the row never comes, the grid stays where it is. After a later load, such as a sort, a filter or a new page, the grid scrolls back to the top.

## Keep your own module's state

The state is a keyed store at \`grid.services.get('state')\`, with \`get\`, \`set\` and \`delete\`. Pick a key of your own, read it once AG Grid is ready, and write it when it changes.

{{story: Reopen the last previewed ticket}}
`

const meta = {
    title: 'Controls/Grid/State',
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
    name: 'Bring the user back where they left off',
    render: () => renderStory(<ReopenQueueExample />),
    parameters: {
        docs: {
            description: {
                story: `Tickets grouped by status and assignee, remounted from scratch with the same \`stateKey\`. Try: open or close a few groups, scroll down, click a cell, then press *Close and reopen*.`,
            },
        },
    },
}

export const ReopenTheLastPreviewedTicket: Story = {
    name: 'Reopen the last previewed ticket',
    render: () => renderStory(<PreviewStateExample />),
    parameters: {
        docs: {
            description: {
                story: `A preview module that writes the clicked ticket to the grid's state under a key of its own, and reads it back on the next mount. Try: click a ticket, then press *Close and reopen*.`,
            },
        },
    },
}
