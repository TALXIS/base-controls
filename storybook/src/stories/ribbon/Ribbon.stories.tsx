import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnCommandsExample, RibbonExample, SlowLoadExample } from './ribbonExamples'

const DESCRIPTION = `
The ribbon is a bar of commands, such as **Send** or **Download**, that act on what your page shows. You return the commands from its \`onLoad\`, and it draws them as buttons and menus, disables a button while its command runs and moves what does not fit into an overflow menu. Try it below: send the invoice, then send a reminder.

{{canvas: Commands for an invoice}}

## Commands

A command either runs or opens a menu of further commands, as **Download** does in the example.

| Key | Type | Default | Description |
|---|---|---|---|
| \`id\` | \`string\` | Required | Identifies the command across loads. |
| \`label\` | \`string\` | Required | The button's text. |
| \`onExecute\` | \`() => Promise<void> \\| void\` | Required, unless \`commands\` | Runs when the button is clicked. |
| \`commands\` | \`IRibbonCommand[]\` | None | Makes the command a menu of these, instead of running. |
| \`tooltip\` | \`string\` | None | Shown on hover. |
| \`iconName\` | \`string\` | None | A Fluent icon name. |
| \`disabled\` | \`boolean\` | \`false\` | Shows the button disabled. |

## How it behaves

The commands show in the order they are returned. A shimmer stands in for them until the first load finishes, and a reload keeps the previous commands until the new ones arrive, as changing the invoice's status does above. A button is disabled while its \`onExecute\` runs.

When the first load throws, the error shows in place of the commands, with **Details** and **Try again**, which mounts the ribbon anew. When a reload or an \`onExecute\` throws, the commands stay and the ribbon's runtime reports the error as a failed action, which opens the error dialog by default, as **Send reminder** does above: see *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

{{story: A slow load}}

## Props

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onLoad\` | \`(ribbon: IRibbon) => IRibbonCommand[] \\| Promise<IRibbonCommand[]>\` | None | Live | Returns the commands, directly or once loaded; returned directly, they show without a shimmer. Called at mount and on \`reload()\`. |
| \`align\` | \`'start' \\| 'end'\` | \`'start'\` | Live | The side the commands line up against. |
| \`disabled\` | \`boolean\` | \`false\` | Live | Disables every command, menus included. |
| \`className\` | \`string\` | None | Live | Added to the ribbon's box, which also holds the shimmer and a failed first load. |
| \`onSetup\` | \`(ribbon: IRibbon) => void\` | None | At mount | Hands over the ribbon of each mount, before it loads. |
| \`components\` | \`IRibbonComponents\` | Defaults | Live | See *Changing how it looks*. |

## From your code

\`onSetup\` hands over the ribbon of each mount. Its \`lifecycle\`, \`loading\` and \`execute\` are the ones every runtime has: see [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). The ribbon does not know when what your commands depend on changes, so call \`reload()\` then, as the example does when the status changes.

| Member | Does |
|---|---|
| \`getCommands()\` | The commands of the last load; \`undefined\` until the first one finishes. |
| \`isRunning(commandId)\` | Whether the command's \`onExecute\` is running. |
| \`reload()\` | Loads the commands again; the latest call's commands win. Does nothing until the first load succeeds. |
| \`hooks.commands.add(hook, priority?)\` | Adds to the commands on every load: see *Add your own commands*. |
| \`events\` | The ribbon's own events, below. |

| Event | Fires |
|---|---|
| \`onCommandsChanged\` | After a reload brings new commands |
| \`onBeforeExecute(command)\` | Before a command's \`onExecute\` runs |
| \`onAfterExecute(command)\` | Once \`onExecute\` settles, whether it resolved or threw |

## Add your own commands

\`hooks.commands.add(hook, priority?)\` lets code that does not own \`onLoad\`, such as a shared module, add to the commands. The hook gets the commands after every \`onLoad\` and changes them in place; a higher \`priority\` runs later, and the call returns a function that removes the hook. Hooks run on a load, so call \`reload()\` to apply one now.

{{story: Commands from your own code}}

## Changing how it looks

\`Ribbon\` takes \`components\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| Top level | \`onRenderCommandBar\`, with the commands as \`items\` | \`RibbonUiCommandBarComponents\` | The command bar |
| \`shimmer\` | \`onRenderShimmer\` | \`RibbonUiShimmerComponents\` | The shimmer before the first load |
| \`mountError\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed first load |
| \`executeError\` | \`onRenderErrors\` | \`RuntimeExecuteErrorComponents\` | A failed reload or command; the error dialog by default |
| \`container\`, \`loadingOverlay\` | As on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview) | \`RuntimeHostUiContainerComponents\`, \`LoadingOverlayComponents\` | The ribbon's box, and what covers it while \`ribbon.loading\` is shown |

The same UI is exported as plain components that take only props, for a bar with no \`onLoad\` behind it: \`Ribbon.Ui.CommandBar\`, given Fluent's command bar \`items\`, and \`Ribbon.Ui.Shimmer\`.

The commands carry your own labels. To change the wording of **Try again**, **Details** and the default title of a failed command, see [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'The ribbon in DatasetControl: commands for the selected records.' },
    { title: 'RuntimeHost', iconName: 'Processing', href: '?path=/docs/controls-runtimehost-get-started--overview', text: 'The status and lifecycle events of the ribbon\'s runtime.' },
    { title: 'Pieces and slots', iconName: 'Edit', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'Replace what the ribbon draws, piece by piece.' },
]

const meta = {
    title: 'Controls/Ribbon/Get started',
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

export const CommandsForAnInvoice: Story = {
    name: 'Commands for an invoice',
    render: () => renderStory(<RibbonExample />),
}

export const ASlowLoad: Story = {
    name: 'A slow load',
    render: () => renderStory(<SlowLoadExample />),
    parameters: {
        docs: {
            description: {
                story: `An \`onLoad\` that takes two seconds and fails the first time it runs. Try: press **Try again**.`,
            },
        },
    },
}

export const CommandsFromYourOwnCode: Story = {
    name: 'Commands from your own code',
    render: () => renderStory(<OwnCommandsExample />),
    parameters: {
        docs: {
            description: {
                story: `One hook adds **History**, and a later one disables every command while the order is closed. Try: turn on **Order closed**.`,
            },
        },
    },
}
