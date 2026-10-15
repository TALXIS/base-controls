import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EditColumnsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.EditColumns\` is a button that opens the column editor. The user adds, reorders and removes columns, and saving sets them on the provider, which loads again.

\`\`\`tsx
<DatasetControl.Header.End>
    <DatasetControl.EditColumns />
</DatasetControl.Header.End>
\`\`\`

What it offers comes from the provider:

\`\`\`tsx
//the records' own columns, or a related entity's when entityName is given
provider.onGetAvailableColumns = async (options?: IAvailableColumnOptions) => fetchColumns(options?.entityName ?? 'deal')
//the related entities columns can come from
provider.onGetAvailableRelatedColumns = async () => fetchRelatedEntities()
\`\`\`

- The columns the user can add are what the provider's \`getAvailableColumns\` returns: with no entity for the records' own columns, and with the picked entity's name for a related entity's. Code outside the provider can change them through its \`onGetAvailableColumns\` interceptor.
- When \`getAvailableRelatedColumns\` returns any entities, a scope selector lets the user add columns of related records too. It lists the records' own entity first, to switch back to.
- The columns are loaded every time the editor needs them: when it opens, on every search and on every scope picked. The search filters what came back. The related entities are loaded once, as the editor opens. While a load runs, the pickers say *Loading...*; when one throws, its error shows in place of the pickers, with *Details* and *Try again*.
- *Cancel*, or closing the panel, drops the changes.
- Saving sets the columns on the provider, which loads again and clears the selection. The columns the user chose are kept per view: see [**State**](?path=/docs/datasetcontrol-state--overview).

{{story: Choose the columns of a view}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`labels\` | \`Partial<IEditColumnsLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`IEditColumnsComponents\` | Defaults | See [**Appearance**](?path=/docs/datasetcontrol-appearance--overview). |

## From your code

\`control.parts.get('editColumns')\` returns the part while it is rendered. See *Parts live as long as a load* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). Open the editor from a button of your own:

\`\`\`tsx
<DefaultButton text='Columns' onClick={() => control.parts.get('editColumns').open()} />
\`\`\`

| Member | Description |
|---|---|
| \`open()\` | Opens the editor over the provider's columns. |
| \`close()\` | Closes the editor and drops what was not saved. |
| \`save()\` | Sets the columns on the provider, which loads again and clears the selection, and closes the editor. |
| \`isOpen()\` | Whether the editor is open. |
| \`events\` | \`onOpenChanged\`, whenever the editor opens or closes. |
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
    name: 'Choose the columns of a view',
    render: () => renderStory(<EditColumnsExample />),
    parameters: {
        docs: {
            description: {
                story: `Each view keeps the columns the user chose. Try: switch to *Won deals*, open *Edit columns*, add *Probability (%)*, drag it to the top and save, then switch to *All deals* and back.`,
            },
        },
    },
}
