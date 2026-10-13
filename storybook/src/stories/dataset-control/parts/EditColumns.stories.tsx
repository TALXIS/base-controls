import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EditColumnsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.EditColumns\` is a button that opens the column editor. The user adds, reorders and removes columns, and saving sets them on the provider, which loads again.

\`\`\`tsx
//the columns of the records themselves, or of a related entity picked in the scope selector
const loadColumns = async (scope?: IAvailableRelatedColumn): Promise<IColumn[]> => fetchColumns(scope?.relatedEntityName ?? 'deal')

<DatasetControl.Header.End>
    <DatasetControl.EditColumns onLoadColumns={loadColumns} onLoadScopes={fetchRelatedEntities} />
</DatasetControl.Header.End>
\`\`\`

- The columns the user can add are what \`onLoadColumns\` returns. It is called with no scope for the records' own entity, and with the picked scope for a related one.
- With \`onLoadScopes\`, a scope selector lets the user add columns of related records too; without it, there is none.
- Both are called every time the editor needs them: when it opens, on every search and on every scope picked. While they run, the pickers say *Loading...*. When one throws, its error shows in place of the pickers, with *Details* and *Try again*.
- *Cancel*, or closing the panel, drops the changes.
- To open the editor from your own code, call \`control.parts.get('editColumns').open()\`. See [**Your own parts**](?path=/docs/datasetcontrol-customization-your-own-parts--overview).

All its props are on [**Parts**](?path=/docs/datasetcontrol-api-parts--overview) of the API.

{{story: Choose the columns}}
`

const meta = {
    title: 'DatasetControl/Parts/Edit columns',
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

export const ChooseTheColumns: Story = {
    name: 'Choose the columns',
    render: () => renderStory(<EditColumnsExample />),
    parameters: {
        docs: {
            description: {
                story: `Switch to *Won deals*, open *Edit columns*, add *Probability (%)*, drag it to the top and save. Switch to *All deals* and back: *Won deals* keeps the columns you chose.`,
            },
        },
    },
}
