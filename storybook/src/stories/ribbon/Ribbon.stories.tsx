import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { RibbonExample, SlowLoadExample } from './ribbonExamples'

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
| \`isDisabled\` | \`boolean\` | \`false\` | Shows the button disabled. |

## How it behaves

The commands show in the order they are returned. A shimmer stands in for them until a load finishes, and a reload keeps the previous commands until the new ones arrive, as changing the invoice's status does above. A button is disabled while its \`onExecute\` runs.

When \`onLoad\` throws, the error shows in place of the commands, with **Try again** and **Details**. When \`onExecute\` throws, the error dialog opens: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

{{story: A slow load}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IRibbonCommand[]>\` | None | Returns the commands. Called at mount and on \`reload()\`. |
| \`align\` | \`'start' \\| 'end'\` | \`'start'\` | The side the commands line up against. |
| \`disabled\` | \`boolean\` | \`false\` | Disables every command, menus included. |
| \`className\` | \`string\` | None | Added to the ribbon's box and to its shimmer. |
| \`onReady\` | \`(ribbon: IRibbonRuntime) => void\` | None | Hands over the ribbon before the first load. At mount. |
| \`components\` | \`IRibbonComponents\` | Defaults | See *Changing how it looks*. |

## From your code

\`onReady\` hands over the ribbon. The ribbon does not know when what your commands depend on changes, so call \`reload()\` then, as the example does when the status changes.

| Member | Does |
|---|---|
| \`getCommands()\` | The commands of the last load; \`undefined\` until the first one finishes. |
| \`isRunning(commandId)\` | Whether the command's \`onExecute\` is running. |
| \`reload()\` | Loads the commands again; the latest call's commands win. |
| \`registerCommands(hook, priority?)\` | Adds to the commands on every load. |
| \`getError()\` | What the last load threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\`, \`onLoaded\`, \`onBeforeExecute(command)\`, \`onExecuteFailed(command, error)\` and \`onAfterExecute(command)\`. |

## Add your own commands

\`registerCommands(hook, priority?)\` lets code that does not own \`onLoad\` add to the commands. \`hook(commands)\` changes them in place after every \`onLoad\`, a higher \`priority\` runs later, and the call returns its unregistration. Call \`reload()\` to apply it now.

## Changing how it looks

\`Ribbon\` takes \`components\`. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| Top level | \`onRenderCommandBar\`, with the commands as \`items\` | \`RibbonUiComponents\` | The command bar |
| \`loadingBoundary\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | The shimmer before the first load |
| \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load |

**Strings:** the commands carry your own labels; a failed load's **Try again** and **Details** come from \`ERROR_MESSAGE_BAR_LABELS\`, keys \`errorMessageBar.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'The ribbon in DatasetControl: commands for the selected records.' },
    { title: 'Pieces and slots', iconName: 'Edit', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'Replace what the ribbon draws, piece by piece.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate the strings the ribbon draws itself.' },
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
                story: `An \`onLoad\` that takes two seconds and fails the first time. Try: press **Try again**, then **Mount again**.`,
            },
        },
    },
}
