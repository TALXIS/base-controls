import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { BackWhereYouLeftOffExample } from '../../../../concepts/guide/your-data/backWhereYouLeftOffExamples'

const STEP = 'Back where you left off'

const DESCRIPTION = `
{{block: progress}}

This step starts from the app of [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) and changes one thing: users who leave the stores and come back find them as they left them, on the same view and sorted the same way.

{{canvas: Back where you left off}}

## How it works

Only *GridExample.tsx* changes, and in **Code** its new lines carry \`//new:\`. A **state key**, a control's \`stateKey\`, names the entry it keeps its state under, so it comes back as the user left it. *Show the stores* stands in for leaving the page: turned off, it unmounts the list.

| In the code | Keeps | See |
|---|---|---|
| \`stateKey='start.stores'\` on \`DatasetControl\` | The view the user is on and, for each view, its columns, sorting, filters, search, page and selection | [**Back where they left off**](?path=/docs/controls-datasetcontrol-guide-your-data-back-where-they-left-off--overview) in the DatasetControl guide |
| \`stateKey='grid'\` on the grid | The row at the top and the focused cell, for each view | [**Back where they left off**](?path=/docs/controls-grid-guide-features-back-where-they-left-off--overview) in the Grid guide |

Both are kept in the nearest state store. On this page that is the page's own, in memory, so the list comes back as it was after the toggle, but not after a reload of the page. To keep them longer, save the store, as [**State persistence**](?path=/docs/concepts-state-persistence--overview) describes.

## Try it

- Open *Not open yet*, sort by *Floor area (m²)*, then turn *Show the stores* off and on: *Not open yet*, sorted by *Floor area (m²)*.
- Click Ghent's *Manager*, then turn the list off and on: the same cell has the focus.
- In **Code**, remove \`stateKey='start.stores'\` and do the same: the list opens on *All stores*.

## Remember

- A \`stateKey\` brings a control back as the user left it.
- The state lasts as long as its store: save the store to keep it past the page.

Your app saves where you keep your data, runs in Power Apps and brings users back where they left off. Make it yours draws it your way.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Your data/Back where you left off',
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

export const BackWhereYouLeftOff: Story = {
    name: 'Back where you left off',
    tags: ['!dev'],
    render: () => renderStory(<BackWhereYouLeftOffExample />),
}
