import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EditColumnsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.EditColumns\` is a button that opens the column editor. The user adds, reorders and removes columns, and saving sets them on the provider, which loads again.

\`\`\`tsx
//the columns of the records themselves, or of a related entity picked in the scope selector
const loadColumns = async (scope?: IAvailableRelatedColumn): Promise<IColumn[]> => fetchColumns(scope?.relatedEntityName ?? 'deal')

<DatasetControl.Header.End>
    <DatasetControl.EditColumns onLoadColumns={loadColumns} onLoadScopes={fetchRelatedEntities} />
</DatasetControl.Header.End>
\`\`\`

- The columns the user can add are what \`onLoadColumns\` returns: called with no scope for the records' own columns, and with the picked scope for a related entity's.
- With \`onLoadScopes\`, a scope selector lets the user add columns of related records too; without it, there is none. The selector lists exactly what it returns, so include the records' own entity for the user to switch back to.
- Both are called every time the editor needs them: when it opens, on every search and on every scope picked. The search itself filters what they returned. While they run, the pickers say *Loading...*; when one throws, its error shows in place of the pickers, with *Details* and *Try again*.
- *Cancel*, or closing the panel, drops the changes.
- Saving sets the columns on the provider, which loads again and clears the selection. The columns the user chose are kept per view: see [**State**](?path=/docs/datasetcontrol-state--overview).

{{story: Choose the columns of a view}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoadColumns\` | \`(scope?: IAvailableRelatedColumn) => Promise<IColumn[]>\` | Required | The columns the user can add. |
| \`onLoadScopes\` | \`() => Promise<IAvailableRelatedColumn[]>\` | None | The entities columns can come from, the records' own included. Shows the scope selector. |
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
