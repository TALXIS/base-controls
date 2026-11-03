import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FailedActionsExample, FailedLoadExample } from '../../dataset-control/examples/errorHandlingExamples'

const DESCRIPTION = `
Loading records, running a command or saving a view all go through code that can fail, and the user needs to see what went wrong and try again. The control takes care of that: it shows every failure to the user, so your code only has to throw. A failed load shows the error in place of the parts, with *Try again*; a failed action, such as a ribbon command, opens the error dialog.

{{story: Recover from a failed load}}

## What fails

| What fails | What the user sees |
|---|---|
| A load: \`onLoadDependencies\`, a module's \`onLoad\`, \`onLoadViews\`, a view's \`resolve\`, \`onLoad\`, or the provider's first page | The error in place of the parts, with *Details* and *Try again*. |
| A part throws while it renders | The same error; *Try again* draws the parts again, without loading. |
| The provider fails a later load, such as a search or another page | The error in \`DatasetControl.Notifications\`. See [**Notifications and empty records**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-records--overview). |
| The ribbon's \`onLoad\` throws | The error in place of the commands, with *Details* and *Try again*. |
| A ribbon command's \`onExecute\` throws | The error dialog. |
| Saving or deleting a user view fails | The error dialog, while \`DatasetControl.UserQueries\` is rendered. |
| Loading the columns Edit columns offers throws | The error in place of the pickers, with *Details* and *Try again*. |

## Failed loads

The error's \`message\` is the title, and *Details* opens the error dialog with its \`cause\`, or its stack when it has none, as \`loadDealsOnRetry\` in the first example throws.

- A failed load leaves no provider behind: the parts are not drawn until a load succeeds.
- *Try again* calls \`control.retry()\`: the control mounts anew and loads the view that failed, from the first step.
- \`retry()\` does not ask about unsaved changes, as a failed load has none.

## Failed actions

A ribbon command that throws, and a user view that fails to save or delete, open the error dialog with the error's \`message\` and its stack as the details. It is the PCF context's \`navigation.openErrorDialog\`, so in a PCF control it is the host's own dialog: see [**PCF context**](?path=/docs/concepts-pcf-context--overview).

A user view fails when:

- the store throws;
- a \`saveWithView\` getter throws;
- a save or delete in *Manage views* returns \`success: false\`.

Without a message of its own, the dialog shows the \`userQueries.saveFailed\` or \`userQueries.deleteFailed\` label.

{{story: Take the server down}}

## React to a failure yourself

The control shows the failure either way. To also log it, or show it elsewhere, listen in \`onMounted\`, which runs for every mount; both examples log below the control.

| Event | On | Arguments |
|---|---|---|
| \`onLoadFailed\` | \`control.events\` | \`error\` |
| \`onExecuteFailed\` | The ribbon's \`events\` | \`command\`, \`error\` |
| \`onOperationFailed\` | The \`userQueries\` module's \`events\` | \`error\` |

Without \`DatasetControl.UserQueries\` rendered, \`onOperationFailed\` is the only sign a user view failed. Events, parts and modules are on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).
`

const meta = {
    title: 'Controls/DatasetControl/Error handling',
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
                story: `The first load fails, and the control shows the error in place of its parts. Try: open *Details* to read the \`cause\`, then press *Try again*, which mounts the control anew and succeeds, and watch the logged count.`,
            },
        },
    },
}

export const TakeTheServerDown: Story = {
    name: 'Take the server down',
    render: () => renderStory(<FailedActionsExample />),
    parameters: {
        docs: {
            description: {
                story: `A ribbon command and the user's own views, both going through a server you can take down. Try: turn on *Server is down*, then press *Sync to CRM*, or pick *Save as new view* in the view switcher: each opens the error dialog and is logged below.`,
            },
        },
    },
}
