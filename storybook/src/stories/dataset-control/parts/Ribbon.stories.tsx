import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RibbonExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.Ribbon\` shows the commands your \`onLoad\` returns and runs one when it is clicked. It calls \`onLoad\` again whenever the selected records change, so read the selection inside it and return only the commands that apply.

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
- While the commands load, a shimmer stands in for them. When \`onLoad\` throws, the ribbon shows the error, with *Details* and *Try again*.
- In \`Header.End\` the commands sit against the right; in \`Header.Start\`, against the left.
- The same ribbon, without the reload on selection, is exported as \`Ribbon\`, for a command bar outside DatasetControl.

{{story: Commands for the selected deals}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IRibbonCommand[]>\` | Required | Returns the commands. Called at mount, whenever the selection changes, and on \`reload()\`. |
| \`disabled\` | \`boolean\` | \`false\` | Disables every command. |
| \`align\` | \`'start' \\| 'end'\` | Its region's side | Which side the commands are drawn against. |
| \`className\` | \`string\` | None | Added to the ribbon's box. |
| \`components\` | \`IRibbonComponents\` | Defaults | See [**Appearance**](?path=/docs/datasetcontrol-appearance--overview). |

A command:

| Field | Type | Description |
|---|---|---|
| \`id\` | \`string\` | Identifies the command across loads. Required. |
| \`label\` | \`string\` | The button's text. Required. |
| \`tooltip\` | \`string\` | Shown on hover. |
| \`iconName\` | \`string\` | A Fluent icon name. |
| \`isDisabled\` | \`boolean\` | Shows the button disabled. |
| \`onExecute\` | \`() => Promise<void> \\| void\` | Runs when the button is clicked. Required. |

## From your code

The ribbon is \`control.parts.get('ribbon')\`. When a command changes what applies without changing the selection, call its \`reload()\`, as *Mark as won* does in the example:

\`\`\`tsx
const markWon = async (ids: string[]) => {
    await setStage(ids, WON)
    control.parts.get('ribbon').reload()
}
\`\`\`

| Member | Description |
|---|---|
| \`getCommands()\` | The commands \`onLoad\` returned; \`undefined\` until it first finishes. |
| \`isRunning(commandId)\` | Whether the command's \`onExecute\` is running. |
| \`reload()\` | Calls \`onLoad\` again. |
| \`getError()\` | What the last \`onLoad\` threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\`, \`onLoaded\`, \`onBeforeExecute(command)\` and \`onAfterExecute(command)\`. |
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
    name: 'Commands for the selected deals',
    render: () => renderStory(<RibbonExample />),
    parameters: {
        docs: {
            description: {
                story: `Select deals: *Mark N as won* and *Reopen* follow the stage of the selected deals, and *Copy name* shows for a single deal. Marking takes a moment, during which the button is disabled, then the ribbon loads its commands again.`,
            },
        },
    },
}
