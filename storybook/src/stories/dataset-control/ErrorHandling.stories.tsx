import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FailedActionsExample, FailedLoadExample } from '../../dataset-control/examples/errorHandlingExamples'

const DESCRIPTION = `
The control shows every failure to the user, so your code only has to throw. A failed load replaces the parts with the error; a failed action, such as a ribbon command, opens the error dialog.

| What fails | What the user sees |
|---|---|
| \`onLoadViews\` or \`onLoad\` throws, or the provider's first page fails to load | The error in place of the parts, with *Details* and *Try again*. |
| A part throws while it renders | The same error; *Try again* mounts the parts again. |
| The provider fails a later load, such as a search or another page | The error in \`DatasetControl.Notifications\`. See [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview). |
| The ribbon's \`onLoad\` throws | The error in place of the commands, with *Details* and *Try again*. |
| A ribbon command's \`onExecute\` throws | The error dialog. |
| Saving, deleting or creating a user view fails | The error dialog, while \`DatasetControl.UserQueries\` is rendered. |
| Loading the columns Edit columns offers throws | The error in place of the pickers, with *Details* and *Try again*. |

## Recover from a failed load

When a load fails, the control shows the error in place of its parts.

- The error's \`message\` is the title.
- *Details* opens the error dialog with the error's \`cause\`, or its stack when it has none.
- *Try again* runs the load that failed again, as \`control.retry()\` does.

\`\`\`tsx
const loadDeals = async (params: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    const response = await fetch(\`/api/deals?view=\${params.view?.id}\`)
    if (!response.ok) {
        throw new Error('The deals could not be loaded.', { cause: await response.text() })
    }
    return { provider: createDealsProvider(await response.json()) }
}
\`\`\`

{{story: Recover from a failed load}}

## Show a failed action

A ribbon command that throws, and a user view that fails to save or delete, open the error dialog: the error's \`message\` with its stack as the details. It is the PCF context's \`navigation.openErrorDialog\`, so in a PCF control it is the host's own dialog. See [**PcfContextProvider**](?path=/docs/providers-pcfcontextprovider--overview).

\`\`\`tsx
const syncToCrm = async () => {
    const response = await fetch('/api/crm/sync', { method: 'POST' })
    if (!response.ok) {
        throw new Error('The CRM did not respond.')
    }
}

<DatasetControl.Ribbon onLoad={async () => [{ id: 'sync', label: 'Sync to CRM', onExecute: syncToCrm }]} />
\`\`\`

- A user view counts as failed when \`onGetViewData\` or the store throws, or when a save or delete in Manage views reports \`success: false\`. The dialog then shows the error, or the \`saveFailed\` and \`deleteFailed\` labels when it gives none. See [**Localization**](?path=/docs/datasetcontrol-localization--overview).

{{story: Show a failed action}}

## React to a failure yourself

The dialog opens either way. To also log a failure, or show it elsewhere, listen for it:

| Event | On | Arguments |
|---|---|---|
| \`onLoadFailed\` | \`control.events\` | \`error\` |
| \`onExecuteFailed\` | The ribbon's \`events\` | \`command\`, \`error\` |

The ribbon mounts anew on every load, so add its listener once each load finishes:

\`\`\`tsx
const onMounted = (control: IDatasetControl) => {
    control.events.addEventListener('onLoadFailed', error => logError('load', error))
    control.events.addEventListener('onLoaded', () => {
        control.parts.whenAvailable('ribbon', ribbon => ribbon.events.addEventListener('onExecuteFailed', (command, error) => logError(command.id, error)))
    })
}
\`\`\`

More on events and parts is on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).
`

const meta = {
    title: 'DatasetControl/Error handling',
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

export const RecoverFromAFailedLoad: Story = {
    name: 'Recover from a failed load',
    render: () => renderStory(<FailedLoadExample />),
    parameters: {
        docs: {
            description: {
                story: `The first load fails, and the control shows the error in place of its parts. Try: open *Details* to read why, then press *Try again*, which succeeds.`,
            },
        },
    },
}

export const ShowAFailedAction: Story = {
    name: 'Show a failed action',
    render: () => renderStory(<FailedActionsExample />),
    parameters: {
        docs: {
            description: {
                story: `A ribbon command and the user's own views, against a server you can take down. Try: turn on *Server is down*, then press *Sync to CRM*, and pick *Save as new view* in the view switcher.`,
            },
        },
    },
}
