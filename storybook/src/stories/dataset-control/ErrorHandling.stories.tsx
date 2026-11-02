import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FailedActionsExample, FailedLoadExample } from '../../dataset-control/examples/errorHandlingExamples'

const DESCRIPTION = `
The control shows every failure to the user, so your code only has to throw. A failed load shows the error in place of the parts; a failed action, such as a ribbon command, opens the error dialog.

| What fails | What the user sees |
|---|---|
| A load: \`onLoadDependencies\`, a module's \`onLoad\`, \`onLoadViews\`, a view's \`resolve\`, \`onLoad\`, or the provider's first page | The error in place of the parts, with *Details* and *Try again*. |
| A part throws while it renders | The same error; *Try again* mounts the parts again. |
| The provider fails a later load, such as a search or another page | The error in \`DatasetControl.Notifications\`. See [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview). |
| The ribbon's \`onLoad\` throws | The error in place of the commands, with *Details* and *Try again*. |
| A ribbon command's \`onExecute\` throws | The error dialog. |
| Saving or deleting a user view fails | The error dialog, while \`DatasetControl.UserQueries\` is rendered. |
| Loading the columns Edit columns offers throws | The error in place of the pickers, with *Details* and *Try again*. |

## Recover from a failed load

The error's \`message\` is the title, and *Details* opens the error dialog with its \`cause\`, or its stack when it has none. A failed load leaves no provider behind: the parts are not drawn until a load succeeds.

\`\`\`tsx
const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    const response = await fetch(\`/api/deals?view=\${view?.id}\`)
    if (!response.ok) {
        throw new Error('The deals could not be loaded.', { cause: await response.text() })
    }
    return { provider: createDealsProvider(await response.json()) }
}
\`\`\`

*Try again* calls \`control.retry()\`: the control mounts anew and loads the view that failed, from the first step. It does not ask about unsaved changes, as a failed load has none.

{{story: Recover from a failed load}}

## Show a failed action

A ribbon command that throws, and a user view that fails to save or delete, open the error dialog: the error's \`message\`, with its stack as the details. It is the PCF context's \`navigation.openErrorDialog\`, so in a PCF control it is the host's own dialog. See [**PCF context**](?path=/docs/pcf-context--overview).

\`\`\`tsx
const syncToCrm = async () => {
    const response = await fetch('/api/crm/sync', { method: 'POST' })
    if (!response.ok) {
        throw new Error('The CRM did not respond.')
    }
}

<DatasetControl.Ribbon onLoad={async () => [{ id: 'sync', label: 'Sync to CRM', onExecute: syncToCrm }]} />
\`\`\`

A user view fails when the store or a \`saveWithView\` getter throws, or when a save or delete in *Manage views* reports \`success: false\`; without a message of its own, the dialog shows the \`userQueries.saveFailed\` or \`userQueries.deleteFailed\` label.

{{story: Show a failed action}}

## React to a failure yourself

The dialog opens either way. To also log a failure, or show it elsewhere, listen in \`onMounted\`, which runs for every mount:

\`\`\`tsx
const onMounted = (control: IDatasetControl) => {
    control.events.addEventListener('onLoadFailed', error => logError('load', error))
    control.parts.observe('ribbon', ribbon => ribbon.events.addEventListener('onExecuteFailed', (command, error) => logError(command.id, error)))
}
\`\`\`

| Event | On | Arguments |
|---|---|---|
| \`onLoadFailed\` | \`control.events\` | \`error\` |
| \`onExecuteFailed\` | The ribbon's \`events\` | \`command\`, \`error\` |

Events and parts are on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).
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
                story: `The first load fails, and the control shows the error in place of its parts. Try: open *Details* to read why, then press *Try again*, which mounts the control anew and succeeds.`,
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
                story: `A ribbon command and the user's own views, against a server you can take down. Try: turn on *Server is down*, then press *Sync to CRM*, and pick *Save as new view* in the view switcher. The user views' store goes through the server, so open **Code** to see it fail.`,
            },
        },
    },
}
