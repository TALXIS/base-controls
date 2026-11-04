import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RibbonExample } from '../../../dataset-control/examples/partsExamples'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'

const DESCRIPTION = `
The ribbon is the bar of commands above the records, such as **Mark as won**, that act on the view or on the records the user selected. You add it with \`DatasetControl.Ribbon\` and return from its \`onLoad\` the commands that apply to the current selection. Try it below: select a few deals and mark them won.

{{canvas: Act on the selected deals}}

## How it behaves

\`DatasetControl.Ribbon\` is the [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview) control, tied to the provider: the commands, how they run and what \`components\` replaces are described there.

- **Selection:** \`onLoad\` runs again whenever the selection changes.
- **Loading:** every button is disabled while the provider loads.
- **Alignment:** in an \`End\` region the commands line up against the right: see [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).
- **Compact header:** a command with an \`iconName\` shows only its icon, with its label as the tooltip, so give every command one.
- **Errors:** see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IRibbonCommand[]>\` | None | Returns the commands. Called at mount, whenever the selection changes, and on \`reload()\`. |
| \`enableSave\` | \`boolean\` | \`false\` | Adds **Save** first, which saves every changed record; disabled while nothing has changed. |
| \`enableRefresh\` | \`boolean\` | \`false\` | Adds **Refresh**, which loads the records again: see [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview) for the unsaved-changes prompt. |
| \`disabled\` | \`boolean\` | \`false\` | Disables every command, menus included. |
| \`className\` | \`string\` | None | Added to the ribbon's box. |
| \`components\` | \`IRibbonComponents\` | Defaults | See *Changing how it looks* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview). |

## From your code

\`control.parts.get('ribbon')\` returns the ribbon once it is drawn: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). Its members are listed under *From your code* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview). When a command changes what applies without changing the selection, call \`reload()\`, as **Mark as won** does in the example.

A module adds its own commands with \`registerCommands\`, as \`addSortMenu\` adds the example's **Sort** menu.

**Strings:** **Save** and **Refresh** come from the keys \`ribbon.save\` and \`ribbon.refresh\`. See [**Localization**](?path=/docs/concepts-localization--overview).

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
