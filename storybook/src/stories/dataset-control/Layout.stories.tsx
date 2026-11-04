import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FullPageExample, PickPartsExample } from '../../dataset-control/examples/layoutExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
The control lays its parts out in regions: a header above the records, a body that holds them and a footer below them, the header and the footer each with a start and an end. You put each part in a region and it sizes itself, and when the control gets narrow, the header turns compact. Try it below: narrow the control with the slider until the header turns compact.

{{canvas: Pick your parts}}

## Place the parts

| Region | Holds |
|---|---|
| \`Header\` | The row above the records. |
| \`Header.Start\`, \`Header.End\` | The header's left and right side. |
| \`Body\` | What shows the records; it fills the height the header and footer leave. |
| \`Footer\` | The row below the records, with a line above it. |
| \`Footer.Start\`, \`Footer.End\` | The footer's left and right side. |

- Any part works in any region, and the parts keep the order you write them in.
- A side only decides where a part sits: every part sizes itself.
- A part that lines up its buttons, such as the ribbon or the paging, starts them on the left in \`Start\` and on the right in \`End\`.
- A part of your own reads which side it is on with \`useDatasetControlRegion()\`.
- Anything else inside the control, such as \`DatasetControl.Notifications\`, sits between the regions in the order you write it.

## Size the control

\`height\` sizes the control's box. The header and the footer keep their own height, and the body takes the rest.

| \`height\` | The control |
|---|---|
| A length, such as \`'600px'\` | Exactly that tall. |
| \`'100%'\` | Fills its parent, which needs a height of its own. The header is inset 15px from the edges. |
| Left out | As tall as what it holds. |

A grid in the body follows the control:

- With a control \`height\`, the grid fills the body and its own \`height\` is ignored.
- Without one, the grid's own \`height\` applies, or it grows with its rows up to \`maxVisibleRows\`.

{{story: Fill the whole page}}

## Fit a narrow screen

The layout follows the control's own width, not the window's. As the control narrows:

- **The free space runs out:** the view switcher and the ribbon share what is left. A long view name ends in an ellipsis, the ribbon moves commands into its overflow menu, and the quick find shrinks from 230px to 160px.
- **The header's parts no longer fit on one line:** the header turns compact. The ribbon and *Edit columns* show only their icons, with their names in a tooltip, and the quick find becomes a search button, with a dot while it holds a query; clicking it opens the field across the whole header.
- **The footer's parts no longer fit:** the footer's \`End\` moves onto a line of its own.

The header is a \`WrapCompactProvider\`, so a part of your own shrinks with it by reading \`useCompact()\`: see [**Layout**](?path=/docs/concepts-layout--overview) in Concepts, which also covers when the header turns back.

## Good to know

- Each region takes \`className\`, and \`components\` for its box: see [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).
- A custom \`Header\` container must still render a \`WrapCompactProvider\`, or the header stops turning compact.
- A region takes your own content too, such as the page title in the full-page example.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Layout', iconName: 'ViewDashboard', href: '?path=/docs/concepts-layout--overview', text: 'How compact parts work, and how to make your own part shrink with the header.' },
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'The first of the parts: commands for the selected records.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Add parts of your own to any region.' },
]

const meta = {
    title: 'Controls/DatasetControl/Layout',
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

export const PickYourParts: Story = {
    name: 'Pick your parts',
    render: () => renderStory(<PickPartsExample />),
}

export const FillTheWholePage: Story = {
    name: 'Fill the whole page',
    render: () => renderStory(<FullPageExample />),
    parameters: {
        docs: {
            description: {
                story: `The control as a whole page with \`height='100%'\`, its title in the header. Try: scroll the grid while the header and the footer stay put.`,
            },
        },
    },
}
