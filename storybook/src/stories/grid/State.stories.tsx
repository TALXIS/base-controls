import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { PreviewStateExample, ReopenQueueExample } from '../../grid/examples/stateExamples'

const DESCRIPTION = `
The grid can remember where the user was, the row at the top, the focused cell and the open groups, and put them back the next time it mounts. Give it a \`stateKey\` to switch this on; without one it keeps nothing. Try it below: open a few groups and click a cell, then press *Close and reopen*.

{{canvas: Bring the user back where they left off}}

## Where the state is kept

The grid reads its state as it mounts, and writes it as the user scrolls, focuses cells and opens groups. Inside a DatasetControl it is kept per view, in the control's own state (see the DatasetControl's [**State**](?path=/docs/controls-datasetcontrol-state--overview)); outside one, in the \`StateProvider\` around the grid. Where it lives between sessions is up to [**State persistence**](?path=/docs/concepts-state-persistence--overview).

The column layout, sorting, filtering and grouping belong to the provider, not to this state: see *Remember the layout* on [**Columns**](?path=/docs/controls-grid-columns--overview).

## What the grid keeps

| Key | Shape | Description |
|---|---|---|
| \`viewport\` | \`{ scroll?: { rowId? }, focusedCell?: { rowId, columnId } }\` | The row at the top of the viewport and the focused cell. The horizontal scroll is not kept. |
| \`grouping\` | \`{ expandedLevel, toggledGroups }\` | How many levels are open, and the groups the user opened or closed against that level. With the grouping module only. |

On mount, once the kept row has loaded, the grid scrolls it back to the top and focuses the kept cell; if the user scrolls or clicks a cell first, the grid stays where it is. A later load, such as a sort, a filter or a new page, scrolls back to the top.

## Keep your own module's state

The state is a keyed store at \`grid.services.get('state')\`, with \`get\`, \`set\` and \`delete\`. Pick a key of your own, read it once AG Grid is ready, and write it when it changes.

{{story: Reopen the last previewed ticket}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'State persistence', iconName: 'Save', href: '?path=/docs/concepts-state-persistence--overview', text: 'Keep the state between sessions, in the browser or your own store.' },
    { title: 'Grouping and totals', iconName: 'GroupList', href: '?path=/docs/controls-grid-modules-grouping-and-totals--overview', text: 'Group the rows by a column, and open the groups as deep as you need.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-extending-write-a-module--overview', text: 'Package a feature of your own, with state of its own.' },
]

const meta = {
    title: 'Controls/Grid/State',
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
    name: 'Bring the user back where they left off',
    render: () => renderStory(<ReopenQueueExample />),
}

export const ReopenTheLastPreviewedTicket: Story = {
    name: 'Reopen the last previewed ticket',
    render: () => renderStory(<PreviewStateExample />),
    parameters: {
        docs: {
            description: {
                story: `A preview module that keeps the clicked ticket in the grid's state under a key of its own. Try: click a ticket, then press *Close and reopen*.`,
            },
        },
    },
}
