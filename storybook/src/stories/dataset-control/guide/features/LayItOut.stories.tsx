import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { LayItOutExample } from '../../../../dataset-control/guide/features/layItOutExamples'

const STEP = 'Lay it out'

const DESCRIPTION = `
{{block: progress}}

The deal list opens on a wide screen, in a side panel and on a phone. Its parts sit in regions, the list fills the box it is given, and its header turns compact as the list narrows.

{{canvas: Lay it out}}

## How it works

This step puts the list of [**Messages and nothing to show**](?path=/docs/controls-datasetcontrol-guide-features-messages-and-nothing-to-show--overview) in a box 480px tall under a *Width (%)* slider, and adds an export button of your own to the header. \`showSyncMessage\` moves to *syncMessage.ts* as it was, and **Break the connection** has done its job and goes. In **Code**, the new lines carry \`//new:\`.

**Regions.** The control lays its parts out in regions:

| Region | Holds |
|---|---|
| \`Header\` | The row above the records |
| \`Header.Start\`, \`Header.End\` | The header's left and right side |
| \`Body\` | What shows the records; it takes the height the header and footer leave |
| \`Footer\` | The row below the records, with a line above it |
| \`Footer.Start\`, \`Footer.End\` | The footer's left and right side |

Any part works in any region, and the parts keep the order you write them in. A side only decides where a part sits: a part that lines up buttons, such as the ribbon or the paging, lines them up on the left in \`Start\` and on the right in \`End\`, and a part of your own reads its side with \`useDatasetControlRegion()\`. A region takes content of your own too, such as \`ExportButton\`. Anything outside the regions, such as the notifications, sits between them in the order you write it.

**Height.** \`height\` sizes the control's box; the header and the footer keep their own height, and the body takes the rest.

| \`height\` | The control |
|---|---|
| A length, such as \`'480px'\` | Exactly that tall |
| \`'100%'\` | Fills its parent, which needs a height of its own; the header is inset 15px from the edges |
| Left out | As tall as what it holds |

A grid in the body follows the control: with a control \`height\`, the grid fills the body and its own \`height\` is ignored; without one, the grid's own \`height\` applies, or it grows with its rows up to \`maxVisibleRows\`.

**Narrowing.** The layout follows the control's own width, not the window's. As the control narrows:

1. **The free space runs out:** the view switcher and the ribbon share what is left. A long view name ends in an ellipsis, then the ribbon moves its commands into an overflow menu.
2. **The header's parts no longer fit on one line:** the header turns compact. The ribbon and **Edit columns** show only their icons, with their names as tooltips, and the quick find becomes a search button, with a dot while it holds a query; pressing it opens the field across the header.
3. **The footer's parts no longer fit on one line:** its \`End\` moves onto a line of its own.

The header is a \`WrapCompactProvider\`, so a part of your own turns compact with it by reading \`useCompact()\`, as \`ExportButton\` does. A \`Header\` whose \`components\` replace its box must still render a \`WrapCompactProvider\`, or the header stops turning compact. How compact parts work, and when the header turns back, is on Concepts' [**Layout**](?path=/docs/concepts-layout--overview).

## Try it

- Drag *Width (%)* down slowly: first **Refresh** moves into the ribbon's overflow menu, then the header turns compact, with only icons and a search button. Point at an icon: its name shows.
- Press the search button, search for *Contoso* and click the grid: the button keeps a dot while it holds the query.
- Switch to *All deals* and scroll the grid: the header and the footer stay where they are.
- In **Code**, rename *My deals* in *deals.ts* to *My deals closing this quarter*: the name ends in an ellipsis, and gives way further as the list narrows.

## Remember

- Parts go in regions: a header and a footer, each with a \`Start\` and an \`End\`, and a body.
- \`height='100%'\` fills a parent with a height of its own, and a grid in the body follows the control.
- The header turns compact by its own width; \`useCompact()\` lets your own parts follow it.

Your list has every part. Next, keep what users make of it.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Features/Lay it out',
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

export const LayItOut: Story = {
    name: 'Lay it out',
    tags: ['!dev'],
    render: () => renderStory(<LayItOutExample />),
}
