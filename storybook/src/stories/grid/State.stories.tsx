import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ReopenQueueExample } from '../../grid/examples/stateExamples'

const DESCRIPTION = `
The \`state\` prop remembers where the user was: the cell at the top-left of the viewport, the open groups and the focused cell. Hand the same object to the next grid to put the user back.

\`\`\`tsx
const state = React.useRef<IGridState>({})

<Grid.Root provider={provider} modules={modules} state={state.current} />
\`\`\`

- The grid reads \`state\` once, at mount, and writes into the same object as the user scrolls, opens groups and focuses cells. Keep the object, and it is always current.
- It is a plain object, so you can store it as JSON and pass it back on the next visit.
- The column layout, sorting, filtering and grouping are the provider's, not part of this state: see *Remembering the layout* on [**Columns**](?path=/docs/grid-columns-overview--overview).

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
