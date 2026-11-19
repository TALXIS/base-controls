import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { MakeItFitExample } from '../../../../map/guide/basics/makeItFitExamples'

const STEP = 'Make it fit'

const DESCRIPTION = `
{{block: progress}}

The trip map sits in a panel whose height the page decides, and fills whatever space it is given.

{{canvas: Make it fit}}

## How it works

This step puts the map of [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) in a panel and leaves out its \`height\`. In **Code**, the new lines carry \`//new:\`.

**Height.** \`height\` sizes the map's box:

| \`height\` | The map |
|---|---|
| Left out | Fills its parent: the free space of a flex parent, along its direction, or the height of any other parent that has one. Never shorter than 200 pixels, so a parent without a height still shows a map. |
| A length, such as \`'480px'\` | That tall, unless a flex parent has less room, which shrinks it. |

**The panel.** The panel is a flex column whose height the slider sets. The map is all it holds, so it takes the whole height; beside a heading or a toolbar in the same column, it would take the height they leave.

**Redrawing.** When its box changes size, the map redraws to fill it at the same centre and zoom. It fits the pins again only when the provider loads.

**\`className\`** adds a class to the map's box, such as for a border or a margin; leave its size to \`height\` and the parent.

In a \`DatasetControl\` with a \`height\`, the map in its body takes the height the header and the footer leave: see [**A trip planner**](?path=/docs/controls-map-guide-your-data-a-trip-planner--overview).

## Try it

- Drag **Panel height** to 700px: the map grows with the panel.
- Add \`height='300px'\` to \`LeafletMap\`, then drag the slider up: the map stays 300 pixels tall.
- Put \`<h3>EU capitals</h3>\` in the panel above \`DataProviderScope\`: the map takes the height the heading leaves.
- Delete \`height: panelHeight\` from the panel: the map is 200 pixels tall, the least it takes.

## Remember

- Left out, \`height\` lets the map fill its parent.
- Give the parent a height, or put the map in a flex layout.
- The map redraws as its box changes size.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Basics/Make it fit',
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

export const MakeItFit: Story = {
    name: 'Make it fit',
    tags: ['!dev'],
    render: () => renderStory(<MakeItFitExample />),
}
