import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RibbonExample } from '../../../dataset-control/examples/partsExamples'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'

const DESCRIPTION = `
The ribbon is the bar of commands above the records, such as **Mark as won**. It is the [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview) control, loaded again whenever the selection changes so its commands fit the selected records, and it can add **Save**, **Discard changes** and **Refresh** of its own. Try it below: change a deal's value, then save it from the ribbon.

{{canvas: Act on the selected deals}}

## Built-in commands

Each is off until its prop is set, and they come before the commands from \`onLoad\`.

| Prop | Command | Does |
|---|---|---|
| \`enableSave\` | **Save** | Saves every changed record. Shows only while there are unsaved changes. |
| \`enableDiscard\` | **Discard changes** | Undoes every unsaved change. Shows only while there are unsaved changes. |
| \`enableRefresh\` | **Refresh** | Loads the records again, asking about unsaved changes first: see [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview). |

**Strings:** the commands' labels are the keys \`ribbon.save\`, \`ribbon.discard\` and \`ribbon.refresh\`. See [**Localization**](?path=/docs/concepts-localization--overview).

## How it behaves

- **Selection:** \`onLoad\` runs again whenever the selection changes, so return the commands that apply to it.
- **Loading:** every command is disabled while the provider loads.
- **Alignment:** in an \`End\` region the commands line up against the right: see [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).
- **Compact header:** a command with an \`iconName\` shows only its icon, with its label as the tooltip, so give every command one.
- **Errors:** what the user sees when \`onLoad\` or a command throws is on [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

## Props

\`DatasetControl.Ribbon\` takes the props of [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview), such as \`onLoad\`, \`disabled\` and \`components\`, except two: \`align\` follows the region, and \`onSetup\` gives way to \`control.parts\`, under *From your code*. It adds \`enableSave\`, \`enableDiscard\` and \`enableRefresh\`, each a \`boolean\` that defaults to \`false\`, under *Built-in commands*.

## From your code

\`control.parts.get('ribbon')\` returns the ribbon once it is drawn: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). Its members are under *From your code* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview). When a command changes what applies without changing the selection, call \`reload()\`, as **Mark as won** does in the example's \`DealsRibbon.tsx\`.

To add commands from outside \`onLoad\`, such as from a module, observe the ribbon and call \`hooks.commands\`, as \`addSelectMenu\` adds the example's **Select** menu: see *Add your own commands* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick find', iconName: 'Search', href: '?path=/docs/controls-datasetcontrol-parts-quick-find--overview', text: 'The next part: a search field that narrows the records down.' },
    { title: 'Ribbon', iconName: 'GlobalNavButton', href: '?path=/docs/controls-ribbon-get-started--overview', text: 'Commands and menus, how they run, and changing how the ribbon looks.' },
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
