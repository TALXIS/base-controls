import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FullPageExample, PickPartsExample } from '../../dataset-control/examples/layoutExamples'

const DESCRIPTION = `
Around the records sit the parts the user works with, such as the view switcher, the ribbon, quick find and paging. The control lays them out in *regions*: a header above the records, a body that holds them and a footer below them, the header and the footer each with a start and an end. You put each part in a region and it sizes itself, and when the control gets narrow, the header turns compact.

{{story: Pick your parts}}

| Region | Description |
|---|---|
| \`Header\` | The row above the records. |
| \`Header.Start\`, \`Header.End\` | The header's left and right side. They only decide where a part sits; every part sizes itself. |
| \`Body\` | Fills the height the header and footer leave. Put what shows the records here. |
| \`Footer\` | The row below the records, with a line above it. |
| \`Footer.Start\`, \`Footer.End\` | The footer's left and right side. |

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

## Place the parts

- Any part works in any region, and the parts keep the order you write them in.
- \`Start\` puts a part on the left and \`End\` on the right.
- A part that lines up its buttons, such as the ribbon or the paging, starts them on the left in \`Start\` and on the right in \`End\`.
- A part of your own reads which side it is on with \`useDatasetControlRegion()\`.

## Fit a narrow screen

The layout follows the control's own width, not the window's.

| As the control narrows | What gives way |
|---|---|
| The free space runs out | The view switcher and the ribbon share what is left: a long view name ends in an ellipsis, and the ribbon moves commands into its overflow menu. The quick find shrinks from 230px to 160px. |
| The header's parts no longer fit on one line | The header turns *compact*: the ribbon and *Edit columns* show only their icons, with their names in a tooltip, and the quick find becomes a search button, with a dot while it holds a query. Clicking it opens the field across the whole header until you leave it. |
| The footer's parts no longer fit | The footer's \`End\` moves onto a line of its own. |

When the header turns back is under *Shrink when parts would wrap* on [**Compact parts**](?path=/docs/concepts-layout-compact-parts--overview).

### Your own part in a compact header

The header is a \`WrapCompactProvider\`, so a part of your own shrinks by reading \`useCompact()\`: see [**Concepts › Layout › Compact parts**](?path=/docs/concepts-layout-compact-parts--overview).

## Good to know

- Each region takes \`className\`, and \`components\` for its box: see [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).
- A custom \`Header\` container must still render a \`WrapCompactProvider\`, or the header stops turning compact.
- A region takes your own content too, such as the page title in the full-page example.
- Anything else inside the control, such as \`DatasetControl.Notifications\`, sits between the regions in the order you write it.
`

const meta = {
    title: 'Controls/DatasetControl/Layout',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
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
    parameters: {
        docs: {
            description: {
                story: `Each part keeps its side, and the rows keep their height. Try: narrow the control with the slider until the header turns compact, open the search, then turn parts off to see the header go back to full size.`,
            },
        },
    },
}

export const FillTheWholePage: Story = {
    name: 'Fill the whole page',
    render: () => renderStory(<FullPageExample />),
    parameters: {
        docs: {
            description: {
                story: `The control as a whole page with \`height='100%'\`, its title in the header; the frame stands in for the window. Try: change the page size; the header and footer stay put and the grid scrolls in what they leave.`,
            },
        },
    },
}
