import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ReopenQueueExample } from '../../grid/examples/stateExamples'

const DESCRIPTION = `
A grid with a \`stateKey\` remembers where the user was: the cell at the top-left of the viewport, the open groups and the focused cell. The next grid with the same \`stateKey\` puts the user back.

\`\`\`tsx
<DatasetControl onLoad={loadTickets}>
    <DatasetControl.Body>
        <Grid stateKey='tickets' modules={[createClientSideRowModelModule(), createGroupingModule()]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Bring the user back where they left off}}

- The grid reads its state at mount, and writes it as the user scrolls, opens groups and focuses cells.
- Without a \`stateKey\`, the grid keeps nothing.
- Inside a DatasetControl, the grid keeps it per view, in the control's state: see [**DatasetControl › State**](?path=/docs/datasetcontrol-state--overview).
- Where the state is kept is up to [**StateProvider**](?path=/docs/providers-stateprovider--overview).
- The column layout, sorting, filtering and grouping belong to the provider, not to this state. See *Remember the layout* on [**Columns**](?path=/docs/grid-columns--overview).

## What the grid keeps

| Key | Description |
|---|---|
| \`viewport\` | \`scroll: { rowId, columnId }\`, the row and the column at the top-left of the viewport, and \`focusedCell: { rowId, columnId }\`. Ids are AG Grid's row and column ids. |
| \`grouping\` | \`expandedLevel\`, and \`toggledGroups\`: the groups the user opened or closed against that level, by row id. With the grouping module only. |

A row or column that no longer exists is skipped: the grid then starts at the top, or at the first column.

## Keep your own module's state

The state is a keyed store at \`grid.services.get('state')\`. Pick a key of your own, read it when the module starts, and write it when it changes:

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
        grid.services.whenAvailable('gridApi', gridApi => gridApi.addEventListener('rowClicked', event => {
            state.set<IPreviewState>('preview', { recordId: event.data?.getRecordId() })
        }))
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
                story: `Tickets grouped by status and assignee, remounted from scratch with the same \`stateKey\`. Try: open or close a few groups, scroll down and right, click a cell, then press *Close and reopen*.`,
            },
        },
    },
}
