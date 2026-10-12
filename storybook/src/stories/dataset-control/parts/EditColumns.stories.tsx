import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EditColumnsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.EditColumns\` is a button that opens the column editor. The user adds, reorders and removes columns, and saving sets them on the provider, which loads again.

\`\`\`tsx
<DatasetControl.Header.End>
    <DatasetControl.EditColumns />
</DatasetControl.Header.End>
\`\`\`

- The columns the user can add are the provider's available columns.
- With the scope selector on, the user can also add columns of related records, picked from the provider's related columns.
- *Cancel*, or closing the panel, drops the changes.
- To open the editor from your own code, call \`runtime.services.get('editColumns').open()\`. See [**Extending**](?path=/docs/datasetcontrol-customization-extending--overview).

| Prop | Type | Default | What it does |
|---|---|---|---|
| \`enableScopeSelector\` | \`boolean\` | \`true\` | Shows the selector of related records. |
| \`labels\` | \`Partial<IEditColumnsLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization-overview--overview). |
| \`components\` | \`IEditColumnsComponents\` | Defaults | See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview). |

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
