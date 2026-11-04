import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FailedActionsExample, FailedLoadExample } from '../../dataset-control/examples/errorHandlingExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Loading records, running a command or saving a view can fail, and the user needs to see what went wrong. Your code only has to throw: a failed load shows the error in place of the parts, with **Try again**, and a failed action, such as a ribbon command, opens the error dialog. Try it below: open **Details**, then press **Try again**.

{{canvas: Recover from a failed load}}

## What the user sees

- **A load fails**, in \`onLoadDependencies\`, a module's \`onLoad\`, \`onLoadViews\`, a view's \`resolve\`, \`onLoad\` or the provider's first page: the error replaces the parts, with **Details** and **Try again**.
- **A part throws while it renders**: the same error; **Try again** draws the parts again, without loading.
- **The provider fails a later load**, such as a search or another page: the error shows in \`DatasetControl.Notifications\`, see [**Notifications and empty state**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview).
- **The ribbon's \`onLoad\` throws**: the error replaces the commands, with **Details** and **Try again**.
- **Loading the columns *Edit columns* offers throws**: the error replaces the pickers, with **Details** and **Try again**.
- **A ribbon command's \`onExecute\` throws, or saving or deleting a user view fails**: the error dialog opens.

## Failed loads

The error's \`message\` is the title, and **Details** opens the error dialog with its \`cause\`, or its stack when it has none, as \`loadDealsOnRetry\` in the example throws.

- A failed load leaves no provider behind: the parts are not drawn until a load succeeds.
- **Try again** calls \`control.retry()\`: the control mounts anew and loads the view that failed, from the first step.

## Failed actions

The error dialog shows the error's \`message\` and its stack as the details. It is the PCF context's \`navigation.openErrorDialog\`, so in a PCF control it is the host's own dialog: see [**PCF context**](?path=/docs/concepts-pcf-context--overview).

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

Without \`DatasetControl.UserQueries\` rendered, \`onOperationFailed\` is the only sign a user view failed.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/controls-datasetcontrol-loading-data--overview', text: 'When the control loads, and the steps a load runs.' },
    { title: 'Notifications and empty state', iconName: 'Info', href: '?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview', text: 'Show the provider\'s later load errors above the records.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Events, parts and modules, reached from your own code.' },
]

const meta = {
    title: 'Controls/DatasetControl/Error handling',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const TakeTheServerDown: Story = {
    name: 'Take the server down',
    render: () => renderStory(<FailedActionsExample />),
    parameters: {
        docs: {
            description: {
                story: `A ribbon command and the user's views go through a server you can take down. Try: turn on *Server is down*, then press **Sync to CRM**.`,
            },
        },
    },
}
