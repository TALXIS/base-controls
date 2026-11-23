import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { ActOnDealsExample } from '../../../../dataset-control/guide/features/actOnDealsExamples'

const STEP = 'Act on deals'

const DESCRIPTION = `
{{block: progress}}

Anna closes deals and corrects them where she sees them. She ticks deals and marks them won from a bar of commands, or changes a value in its cell and saves it.

{{canvas: Act on deals}}

## How it works

This step adds a ribbon to the header and two modules to the grid of [**Search and page**](?path=/docs/controls-datasetcontrol-guide-features-search-and-page--overview). In **Code**, the new lines carry \`//new:\`.

**Grid modules.** A module adds a feature to the control whose \`modules\` list it, as Concepts' [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview) shows. Here the grid's \`modules\` list two: \`createRowSelectionModule({ mode: 'multiple' })\` puts a checkbox on each row, and \`createEditingModule()\` opens a cell's editor on a double-click. How a cell's value commits is on Grid's [**Edit and save**](?path=/docs/controls-grid-guide-basics-edit-and-save--overview), and every module the grid offers is under *Modules* on Grid's [**Reference**](?path=/docs/controls-grid-reference--overview).

**The ribbon.** \`DatasetControl.Ribbon\` is a bar of commands above the records. Its \`onLoad\` returns the commands, and runs again whenever the selection changes, so it returns the ones that fit the ticked deals. \`DealsRibbon\` reads the control's provider with \`useDataProvider()\`, which any component inside the control can call, and offers **Mark N as won** while open deals are ticked. A command that changes what applies without changing the selection calls \`ribbon.reload()\`, as **Mark N as won** does once the deals are won.

\`DatasetControl.Ribbon\` takes the props of [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview), such as \`disabled\` and \`components\`, except two: \`align\` follows the region, so in \`End\` the commands sit against the right, and in place of \`onSetup\`, your code reaches the ribbon through the control's parts, as in [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview). It adds three commands of its own, each on until its prop is \`false\`, before the ones \`onLoad\` returns:

| Prop | Command | Does |
|---|---|---|
| \`enableSave\` | **Save** | Saves every changed record; shows only while there are unsaved changes |
| \`enableDiscard\` | **Discard changes** | Undoes every unsaved change; shows only while there are some |
| \`enableRefresh\` | **Refresh** | Loads the records again |

With **Save** or **Discard changes** on, \`onLoad\` also runs as unsaved changes appear or go. Every command is disabled while the provider loads. Give each command an \`iconName\`, since a compact header shows only the icons, as [**Lay it out**](?path=/docs/controls-datasetcontrol-guide-features-lay-it-out--overview) shows. What the user sees when a command fails is on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview).

**Unsaved changes.** An edited value stays on its record, unsaved, until **Save** or your own \`provider.save()\`; **Mark N as won** saves the deals it changes at once. While there are unsaved changes, the browser asks before anything loads the records again: discarding the changes goes on, and keeping them cancels the action. It asks before:

- every load in the table of [**Load the deals**](?path=/docs/controls-datasetcontrol-guide-basics-load-the-deals--overview) but the first mount and **Try again**, which have no changes to lose;
- a search, another page, another page size and **Refresh**;
- a sort, filter, group or total in a grid;
- your own \`provider.refresh()\`.

To change the question, see [**Localization**](?path=/docs/concepts-localization--overview).

## Try it

- Tick the first two deals of *My deals*: the ribbon offers **Mark 2 as won**. Press it: both read *Won*, and the command goes.
- Switch to *Won deals*: it holds 9 deals, the two you marked among them.
- Back on *My deals*, double-click a *Value*, type another one and press Enter: **Save** and **Discard changes** appear. Press **Discard changes**: the value is restored, and both commands go.
- Change a value again and switch to *All deals*: the browser asks whether to discard the change.

## Remember

- Grid modules, in the grid's \`modules\`, add ticking rows and editing cells.
- The ribbon's \`onLoad\` runs on every selection: return the commands that fit it.
- The built-in commands are on unless \`enableSave\`, \`enableDiscard\` or \`enableRefresh\` is \`false\`.
- Nothing loads over unsaved changes without asking.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Features/Act on deals',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ActOnDeals: Story = {
    name: 'Act on deals',
    tags: ['!dev'],
    render: () => renderStory(<ActOnDealsExample />),
}
