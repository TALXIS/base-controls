import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ReopenQueueExample } from '../../grid/examples/stateExamples'

const DESCRIPTION = `
A grid with a \`stateKey\` remembers where the user was: the row at the top of the viewport, the focused cell and the open groups. The next grid mounted with the same \`stateKey\` puts the user back. Without a \`stateKey\`, the grid keeps nothing.

\`\`\`tsx
<DatasetControl onLoad={loadTickets}>
    <DatasetControl.Body>
        <Grid stateKey='tickets' modules={[createClientSideRowModelModule(), createGroupingModule()]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Bring the user back where they left off}}

The grid reads its state as it mounts and writes it as the user scrolls, focuses cells and opens groups. Inside a DatasetControl it is kept per view, in the control's own state: see [**DatasetControl › State**](?path=/docs/datasetcontrol-state--overview). Where the state lives between sessions is up to [**State persistence**](?path=/docs/state-persistence--overview).

The column layout, sorting, filtering and grouping belong to the provider, not to this state. See *Remember the layout* on [**Columns**](?path=/docs/grid-columns--overview).

## What the grid keeps

| Key | Shape | Description |
|---|---|---|
| \`viewport\` | \`{ scroll?: { rowId? }, focusedCell?: { rowId, columnId } }\` | The row at the top of the viewport and the focused cell, by AG Grid's row and column ids. The horizontal scroll is not kept. |
| \`grouping\` | \`{ expandedLevel, toggledGroups }\` | How many levels are open, and the groups the user opened or closed against that level, by row id. With the grouping module only. |

On mount, the grid waits for the top row to appear, which inside a group means once that group has loaded, then scrolls it to the top and focuses the cell. If the user scrolls or clicks a cell first, or the row never comes, the grid stays where it is. After a later load, such as a sort, a filter or a new page, the grid scrolls back to the top.

## Keep your own module's state

The state is a keyed store at \`grid.services.get('state')\`, with \`get\`, \`set\` and \`delete\`. Pick a key of your own, read it as the module loads, and write it when it changes:

\`\`\`ts
interface IPreviewState {
    recordId?: string
}

const createPreviewModule = (onOpen: (recordId: string) => void): IGridModule => ({
    name: 'preview',
    onLoad: grid => {
        const state = grid.services.get('state')
        const recordId = state.get<IPreviewState>('preview')?.recordId
        if (recordId) {
            onOpen(recordId)
        }
        grid.services.observe('gridApi', gridApi => {
            gridApi.addEventListener('rowClicked', event => state.set<IPreviewState>('preview', { recordId: event.data?.getRecordId() }))
        })
    },
})
\`\`\`
`

const meta = {
    title: 'Grid/State',
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
