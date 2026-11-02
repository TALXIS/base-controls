import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RibbonExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.Ribbon\` shows the commands its \`onLoad\` returns and runs one when it is clicked. It loads them again whenever the selected records change, so read the selection there and return only the commands that apply.

\`\`\`tsx
const DealsRibbon = () => {
    const provider = useDataProvider()
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const selectedIds = provider.getSelectedRecordIds()
        return selectedIds.length === 0 ? [] : [{ id: 'delete', label: 'Delete', iconName: 'Delete', onExecute: () => deleteDeals(selectedIds) }]
    }
    return <DatasetControl.Ribbon onLoad={onLoad} />
}
\`\`\`

{{story: Act on the selected deals}}

Commands show in the order they are returned, and those that do not fit move into the overflow menu. A command's button is disabled while its \`onExecute\` runs, and every button while the provider loads. A shimmer stands in for the commands while they load. When \`onLoad\` throws, the error shows in their place with *Try again*; when \`onExecute\` throws, the error dialog opens (see [**Error handling**](?path=/docs/datasetcontrol-error-handling--overview)). In \`Header.End\` the commands sit against the right.

The same ribbon, without the reload on selection, is exported as \`Ribbon\`, for a command bar outside DatasetControl.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IRibbonCommand[]>\` | None | Returns the commands. Called at mount, whenever the selection changes, and on \`reload()\`. The commands registered through \`registerCommands\` follow. |
| \`disabled\` | \`boolean\` | \`false\` | Disables every command, menus included. |
| \`className\` | \`string\` | None | Added to the ribbon's box. |
| \`components\` | \`IRibbonComponents\` | Defaults | See [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |

## Commands

A command either runs or opens a menu of further commands.

| Key | Type | Default | Description |
|---|---|---|---|
| \`id\` | \`string\` | Required | Identifies the command across loads. |
| \`label\` | \`string\` | Required | The button's text. |
| \`onExecute\` | \`() => Promise<void> \\| void\` | Required, unless \`commands\` | Runs when the button is clicked. |
| \`commands\` | \`IRibbonCommand[]\` | None | Makes the command a menu of these, instead of running. |
| \`tooltip\` | \`string\` | None | Shown on hover. |
| \`iconName\` | \`string\` | None | A Fluent icon name. |
| \`isDisabled\` | \`boolean\` | \`false\` | Shows the button disabled. |

\`\`\`tsx
{ id: 'export', label: 'Export', iconName: 'Download', commands: [
    { id: 'excel', label: 'To Excel', onExecute: exportToExcel },
    { id: 'csv', label: 'To CSV', onExecute: exportToCsv },
] }
\`\`\`

## From your code

\`control.parts.get('ribbon')\` returns the ribbon once it is drawn (see *Reach the parts* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview)). When a command changes what applies without changing the selection, call \`reload()\`, as *Mark as won* does in the example:

\`\`\`tsx
const markWon = async (ids: string[]) => {
    await setStage(ids, WON)
    control.parts.get('ribbon').reload()
}
\`\`\`

| Member | Description |
|---|---|
| \`getCommands()\` | The commands of the last load; \`undefined\` until the first one finishes. |
| \`isRunning(commandId)\` | Whether the command's \`onExecute\` is running. |
| \`reload()\` | Loads the commands again. |
| \`registerCommands(hook, priority?)\` | Adds to the commands on every load: \`hook(commands)\` changes them in place, after \`onLoad\`. A higher \`priority\` runs later. Returns its unregistration; call \`reload()\` to apply it now. |
| \`getError()\` | What the last load threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\`, \`onLoaded\`, \`onBeforeExecute(command)\`, \`onExecuteFailed(command, error)\` and \`onAfterExecute(command)\`. |

\`registerCommands\` lets a module add its commands to whatever ribbon the page draws:

\`\`\`tsx
control.parts.observe('ribbon', ribbon => ribbon.registerCommands(commands => {
    commands.push({ id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await control.getProvider()!.refresh() } })
}))
\`\`\`
`

const meta = {
    title: 'DatasetControl/Parts/Ribbon',
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

export const CommandsForTheSelectedDeals: Story = {
    name: 'Act on the selected deals',
    render: () => renderStory(<RibbonExample />),
    parameters: {
        docs: {
            description: {
                story: `*Mark N as won* and *Reopen* follow the stage of the selected deals, and *Copy name* shows for a single deal. Try: select deals and mark them won; the button is disabled while it runs, then the commands load again.`,
            },
        },
    },
}
