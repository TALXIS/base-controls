import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { BackWhereTheyLeftOffExample } from '../../../../grid/guide/features/backWhereTheyLeftOffExamples'

const STEP = 'Back where they left off'

const DESCRIPTION = `
{{block: progress}}

A manager opens another page of the app and comes back to the same rows, with the same groups open. This step gives the grid a \`stateKey\`.

{{canvas: Back where they left off}}

## How it works

The grid is the one of [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview), with a \`stateKey\`, under a *Show the deals* toggle that stands in for leaving the page. In **Code**, the new lines carry \`//new:\`.

The grid keeps its **state**, where the user is in it, only with a \`stateKey\`; without one it keeps nothing. It writes the state as the user scrolls, focuses cells and opens groups, and reads it as it mounts:

| Key | Holds | Kept |
|---|---|---|
| \`viewport\` | The row at the top and the focused cell; not the horizontal scroll | Always |
| \`grouping\` | The level the groups open to, and each group the user opened or closed against it | With the grouping module |

On mount, once the kept row has loaded, the grid scrolls it to the top, then focuses the kept cell, which brings that cell into view. If the user scrolls or clicks a cell first, the grid stays where it is. A later load, such as a sort, a filter or **Refresh**, starts at the top.

**Where it is kept.** Inside a DatasetControl, the grid's state is kept with each view, in the control's state, so the key needs to be unique only within the control; outside one, it is kept in the nearest \`StateProvider\`. The columns, sorting, filters, grouping and totals are the provider's, not the grid's, and the control keeps them with each view too. How long all of it lasts is on the DatasetControl guide's [**Back where they left off**](?path=/docs/controls-datasetcontrol-guide-your-data-back-where-they-left-off--overview) and on [**State persistence**](?path=/docs/concepts-state-persistence--overview). A module of your own keeps its state as [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview) shows.

## Try it

- Scroll down to Ben Carter's deals, then turn *Show the deals* off and on: the grid opens where you left it, on Ben Carter's deals.
- Close Ben Carter's group with its chevron, click a *Value* in Chloé Martin's group, then turn the deals off and on: Ben's group is still closed, and that cell has the focus.
- In **Code**, remove \`stateKey='guide.back'\`, close a group, and turn the deals off and on: every group is open again, and the grid is at the top.

## Remember

- With a \`stateKey\`, the grid keeps its top row, its focused cell and its open groups; without one it keeps nothing.
- Inside a DatasetControl, the control keeps the grid's state with each view.
- The columns, sorting, filters and grouping are the provider's, which the DatasetControl keeps.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Features/Back where they left off',
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

export const BackWhereTheyLeftOff: Story = {
    name: 'Back where they left off',
    tags: ['!dev'],
    render: () => renderStory(<BackWhereTheyLeftOffExample />),
}
