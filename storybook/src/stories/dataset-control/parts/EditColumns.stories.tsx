import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EditColumnsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.EditColumns\` is a button that opens the column editor. The user adds, reorders and removes columns, and saving mounts the control anew with them.

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

- The user can add the columns \`getAvailableColumns\` returns. When \`getAvailableRelatedColumns\` returns any entities, a scope selector lets them add columns of related records too.
- While the columns load, the pickers say *Loading...*. When loading throws, the error shows in place of the pickers, with *Details* and *Try again*.
- *Cancel*, or closing the panel, drops the changes.
- Saving mounts the control anew with the new columns, as switching the view does, and clears the selection. The columns the user chose are kept per view: see [**State**](?path=/docs/datasetcontrol-state--overview).

{{story: Choose the columns of a view}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`labels\` | \`Partial<IEditColumnsLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`IEditColumnsComponents\` | Defaults | See *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('editColumns')\` returns the part while it is rendered. See *Parts live as long as a load* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). Open the editor from a button of your own:

\`\`\`tsx
<DefaultButton text='Columns' onClick={() => control.parts.get('editColumns').open()} />
\`\`\`

| Member | Description |
|---|---|
| \`open()\` | Opens the editor over the provider's columns. |
| \`close()\` | Closes the editor and drops what was not saved. |
| \`save()\` | Closes the editor and mounts the control anew with the columns, clearing the selection. |
| \`isOpen()\` | Whether the editor is open. |
| \`events\` | \`onOpenChanged\`, whenever the editor opens or closes. |
| \`getSession()\` | The edit in progress, while the editor is open. |
| \`registerCommands(hook, priority?)\` | Adds commands above the pickers: \`hook(commands, session)\` changes the Fluent \`ICommandBarItemProps\` in place. Returns a function that removes it. |
| \`registerColumnCommands(hook, priority?)\` | Adds commands to each chosen column: \`hook(commands, column, session)\`, with Remove first. A column's commands act on mouse up. |

## Add your own commands

A module adds what it needs through the two hooks, such as a command that creates a column:

\`\`\`ts
control.parts.whenAvailable('editColumns', editColumns => editColumns.registerCommands((commands, session) => {
    commands.push({ key: 'addColumn', text: 'Add column', iconProps: { iconName: 'Add' }, onClick: () => { addColumn(session) } })
}))
\`\`\`

The session holds the edit until it is saved, changed through \`addColumn\` and \`removeColumn\`. The picker fetches the provider's available columns each time it opens. After the provider's columns change, \`session.refreshColumns()\` gives the chosen ones their current definitions.
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
