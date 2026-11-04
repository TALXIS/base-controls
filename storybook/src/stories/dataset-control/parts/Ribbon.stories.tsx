import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RibbonExample } from '../../../dataset-control/examples/partsExamples'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'

const DESCRIPTION = `
The ribbon is the bar of commands above the records, such as *Mark as won*, that act on the view or on the records the user selected. You add it with \`DatasetControl.Ribbon\` and return the commands from its \`onLoad\`, which runs again whenever the selection changes, so you return only those that apply. Try it below: select a few deals and mark them won.

{{canvas: Act on the selected deals}}

## How it behaves

- **Order:** commands show in the order they are returned, and those that do not fit move into the overflow menu.
- **Loading:** a shimmer stands in for the commands on the first load; later loads keep the previous commands until the new ones arrive.
- **Running:** a command's button is disabled while its \`onExecute\` runs, and every button while the provider loads.
- **Errors:** when \`onLoad\` throws, the error shows with *Try again*; when \`onExecute\` throws, the error dialog opens: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).
- **Compact header:** a command with an \`iconName\` shows only its icon; see *Fit a narrow screen* on [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).

## Commands

A command either runs or opens a menu of further commands, as *Sort* does in the example.

| Key | Type | Default | Description |
|---|---|---|---|
| \`id\` | \`string\` | Required | Identifies the command across loads. |
| \`label\` | \`string\` | Required | The button's text. |
| \`onExecute\` | \`() => Promise<void> \\| void\` | Required, unless \`commands\` | Runs when the button is clicked. |
| \`commands\` | \`IRibbonCommand[]\` | None | Makes the command a menu of these, instead of running. |
| \`tooltip\` | \`string\` | None | Shown on hover; in a compact header the label replaces it as the tooltip. |
| \`iconName\` | \`string\` | None | A Fluent icon name; give every command one, so it still shows in a compact header. |
| \`isDisabled\` | \`boolean\` | \`false\` | Shows the button disabled. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IRibbonCommand[]>\` | None | Returns the commands. Called at mount, whenever the selection changes, and on \`reload()\`. |
| \`disabled\` | \`boolean\` | \`false\` | Disables every command, menus included. |
| \`className\` | \`string\` | None | Added to the ribbon's box. |
| \`components\` | \`IRibbonComponents\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

The same command bar is exported as \`Ribbon\`, for use outside DatasetControl. It does not reload on selection, is not disabled while a provider loads, and also takes \`align\` (\`'start'\` or \`'end'\`) and \`onReady(ribbon)\`, which hands over the members below.

## From your code

\`control.parts.get('ribbon')\` returns the ribbon once it is drawn (see *Reach the parts* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)). When a command changes what applies without changing the selection, call \`reload()\`, as *Mark as won* does in the example.

| Member | Does |
|---|---|
| \`getCommands()\` | The commands of the last load; \`undefined\` until the first one finishes. |
| \`isRunning(commandId)\` | Whether the command's \`onExecute\` is running. |
| \`reload()\` | Loads the commands again. |
| \`registerCommands(hook, priority?)\` | Adds to the commands on every load; see *Add your own commands*. |
| \`getError()\` | What the last load threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\`, \`onLoaded\`, \`onBeforeExecute(command)\`, \`onExecuteFailed(command, error)\` and \`onAfterExecute(command)\`. |

## Add your own commands

\`registerCommands\` lets a module add its commands to whatever ribbon the page draws. \`hook(commands)\` changes them in place after \`onLoad\`, a higher \`priority\` runs later, and it returns its unregistration; call \`reload()\` to apply it now.

The example's *Sort* menu is added this way, in \`addSortMenu\`.

**Strings:** the commands carry your own labels; a failed load's *Try again* and *Details* come from \`ERROR_MESSAGE_BAR_LABELS\`, keys \`errorMessageBar.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick find', iconName: 'Search', href: '?path=/docs/controls-datasetcontrol-parts-quick-find--overview', text: 'The next part: a search field that narrows the records down.' },
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/controls-datasetcontrol-error-handling--overview', text: 'What the user sees when onLoad or a command throws.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Reach the ribbon and the other parts from your own code.' },
]

const meta = {
    title: 'Controls/DatasetControl/Parts/Ribbon',
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

export const CommandsForTheSelectedDeals: Story = {
    name: 'Act on the selected deals',
    render: () => renderStory(<RibbonExample />),
}
