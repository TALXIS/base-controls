import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { ViewsAndCommandsExample } from '../../../../concepts/guide/basics/viewsAndCommandsExamples'

const STEP = 'Views and commands'

const DESCRIPTION = `
{{block: progress}}

The team works on the stores that have not opened yet, looks a store up by name, and marks stores open as they open. This step adds views to switch between, a search field, **Edit columns**, and a command of your own.

{{canvas: Views and commands}}

## How it works

The list is the one from [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview). In **Code**, the new lines carry \`//new:\`, and *StoresRibbon.tsx* is new. A **view** is a named way to look at the stores. Its \`resolve\` sets the provider up as the view opens, as *Not open yet* filters out the open stores and sorts the rest by opening date, and returns the columns the view shows. The view switcher, the ribbon, **Edit columns** and the search field are **parts**: components you put inside the control, which work on its provider. Each has a step of its own in the DatasetControl guide:

| In the code | Does | See |
|---|---|---|
| \`VIEWS\`, \`views\` in \`loadStores\`, \`DatasetControl.ViewSwitcher\` | The views, which come with the provider, and the switcher that lists them | [**Views**](?path=/docs/controls-datasetcontrol-guide-basics-views--overview) |
| \`DatasetControl.QuickFind\` | Searches the columns \`QuickFindColumns\` names in *stores.ts*: the store, its manager and its country | [**Search and page**](?path=/docs/controls-datasetcontrol-guide-features-search-and-page--overview) |
| \`DatasetControl.EditColumns\` | Picks the open view's columns among those the provider offers, which for a \`MemoryDataProvider\` are those of \`SavedQueries\`, *Seats* among them | [**Choose the columns**](?path=/docs/controls-datasetcontrol-guide-features-choose-the-columns--overview) |
| \`onLoad\` in *StoresRibbon.tsx* | Returns **Mark N as open** while stores still to open are ticked. The ribbon calls it again on every selection, and \`markOpen\` calls the ribbon's \`reload()\` once the stores are saved | [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview) |
| \`control.parts\` | Finds a part of the control, here the ribbon, from your code | [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview) |

## Try it

- Switch to *Not open yet*: four stores, the soonest to open first.
- Tick *Kraków Kazimierz* and *Ghent Korenmarkt*, and press **Mark 2 as open**: both read *Open*, and the command goes, since no store ticked is still to open. They stay in the view until it loads again.
- Switch to *All stores*: Kraków and Ghent are open there too. Search for *Porto*: one store is left.
- Press **Edit columns**, add *Seats* and press **Save**: the grid shows *Seats* first.

## Remember

- A view sets the provider up as it opens, and names its columns.
- The ribbon's \`onLoad\` returns the commands that fit the stores ticked.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Basics/Views and commands',
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

export const ViewsAndCommands: Story = {
    name: 'Views and commands',
    tags: ['!dev'],
    render: () => renderStory(<ViewsAndCommandsExample />),
}
