import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ReopenQueueExample } from '../../grid/examples/stateExamples'

const DESCRIPTION = `
A grid with a \`stateKey\` remembers where the user was: the cell at the top-left of the viewport, the open groups and the focused cell. The next grid with the same \`stateKey\` puts the user back.

\`\`\`tsx
<DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid stateKey='tickets' modules={modules} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

- The grid reads its state once, at mount, and writes it as the user scrolls, opens groups and focuses cells.
- Without a \`stateKey\`, the grid keeps nothing.
- Inside a DatasetControl, the grid keeps it per view, in the control's state. See [**State**](?path=/docs/datasetcontrol-state--overview) of DatasetControl.
- Where the state is kept is up to [**StateProvider**](?path=/docs/providers-stateprovider--overview).
- The column layout, sorting, filtering and grouping are the provider's, not part of this state. Inside a DatasetControl with a \`stateKey\`, the control keeps them per view; on its own, see *Remembering the layout* on [**Columns**](?path=/docs/grid-columns--overview).

## What the grid keeps

| Key | What it holds |
|---|---|
| \`viewport\` | \`scroll: { rowId, columnId }\`, the row and the column at the top-left of the viewport, and \`focusedCell: { rowId, columnId }\`. Ids are AG Grid's row and column ids. |
| \`grouping\` | \`expandedLevel\`, and \`toggledGroups\`: the groups the user opened or closed against that level, by row id. With the grouping module only. |

A row or column that no longer exists is skipped: the grid then starts at the top, or at the first column.

## Keeping your own module's state

The state is a keyed store at \`runtime.services.get('state')\`. Pick a key of your own, read it when the module starts, and write it when it changes:

\`\`\`ts
interface IPreviewState { recordId?: string }

const createPreviewModule = (): IGridModule => ({
    onRegister: runtime => {
        const state = runtime.services.get('state')
        const opened = state.get<IPreviewState>('preview')?.recordId
        //...open the preview for \`opened\`, then whenever it changes:
        state.set<IPreviewState>('preview', { recordId: '...' })
    },
})
\`\`\`

{{story: Back where you left off}}
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
    name: 'Back where you left off',
    render: () => renderStory(<ReopenQueueExample />),
    parameters: {
        docs: {
            description: {
                story: `The tickets are grouped by status and assignee. Open or close a few groups, scroll down and to the right, click a cell, then press *Close and reopen*. The grid is mounted again from scratch with the same groups open, on the same row, column and focused cell.`,
            },
        },
    },
}
