import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RibbonExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.Ribbon\` shows the commands its own \`onLoad\` returns and runs one when it is clicked. It calls its \`onLoad\` again whenever the selected records change, so read the selection there and return only the commands that apply.

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

- Commands are shown in the order they are returned. Commands that do not fit move into the overflow menu.
- While a command's \`onExecute\` runs, its button is disabled.
- While the commands load, a shimmer shows in their place. When the ribbon's \`onLoad\` throws, it shows the error, with *Details* and *Try again*.
- When a command's \`onExecute\` throws, the error dialog opens. See [**Error handling**](?path=/docs/datasetcontrol-error-handling--overview).
- In \`Header.End\` the commands sit against the right; in \`Header.Start\`, against the left. See *Place the parts* on [**Layout**](?path=/docs/datasetcontrol-layout--overview).
- The same ribbon, without the reload on selection, is exported as \`Ribbon\`, for a command bar outside DatasetControl.

{{story: Act on the selected deals}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IRibbonCommand[]>\` | Required | Returns the commands. Called at mount, whenever the selection changes, and on \`reload()\`. |
| \`disabled\` | \`boolean\` | \`false\` | Disables every command. |
| \`className\` | \`string\` | None | Added to the ribbon's box. |
| \`components\` | \`IRibbonComponents\` | Defaults | See *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |

An \`IRibbonCommand\`:

| Key | Type | Default | Description |
|---|---|---|---|
| \`id\` | \`string\` | Required | Identifies the command across loads. |
| \`label\` | \`string\` | Required | The button's text. |
| \`onExecute\` | \`() => Promise<void> \\| void\` | Required | Runs when the button is clicked. |
| \`tooltip\` | \`string\` | None | Shown on hover. |
| \`iconName\` | \`string\` | None | A Fluent icon name. |
| \`isDisabled\` | \`boolean\` | \`false\` | Shows the button disabled. |

## From your code

\`control.parts.get('ribbon')\` returns the ribbon while it is rendered. See *Parts live as long as a load* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). When a command changes what applies without changing the selection, call the ribbon's \`reload()\`, as *Mark as won* does in the example:

\`\`\`tsx
const markWon = async (ids: string[]) => {
    await setStage(ids, WON)
    control.parts.get('ribbon').reload()
}
\`\`\`

| Member | Description |
|---|---|
| \`getCommands()\` | The commands the ribbon's \`onLoad\` returned; \`undefined\` until it first finishes. |
| \`isRunning(commandId)\` | Whether the command's \`onExecute\` is running. |
| \`reload()\` | Calls \`onLoad\` again. |
| \`getError()\` | What the last \`onLoad\` threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\`, \`onLoaded\`, \`onBeforeExecute(command)\`, \`onExecuteFailed(command, error)\` and \`onAfterExecute(command)\`. |
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
